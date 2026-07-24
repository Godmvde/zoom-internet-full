import type { Data } from "@puckeditor/core";
import { getBrowserSupabase } from "@/lib/supabase-browser";

// Multi-page Puck draft/publish seam.
//
// A site's Puck content is a MAP of route → document, e.g.
//   { "/": {...}, "/about": {...}, "/plans": {...} }
// stored as the single `puck` jsonb blob the RPCs already carry.
//
// Two backends, chosen by whether a Supabase session exists:
//   • signed in  → RLS-gated RPCs (save_content_draft({puck}), publish_site, site_public.puck)
//   • otherwise  → browser localStorage (offline demo)
// Local is always written too, for instant resume.
//
// This file is site-agnostic except SLUG — the site_id is resolved from the
// slug at runtime, so each site's copy differs only in the SLUG constant.

const SLUG = "zoom-internet-full";
const DRAFT_KEY = `rtr:${SLUG}:puck:draft`;
const PUBLISHED_KEY = `rtr:${SLUG}:puck:published`;

export type PuckMap = Record<string, Data>;
export type SaveResult = { ok: boolean; error?: string; synced: boolean };

let siteIdCache: string | null = null;
async function siteId(): Promise<string | null> {
  if (siteIdCache) return siteIdCache;
  try {
    const { data } = await getBrowserSupabase()
      .from("sites")
      .select("id")
      .eq("slug", SLUG)
      .single();
    siteIdCache = (data as { id: string } | null)?.id ?? null;
  } catch {
    siteIdCache = null;
  }
  return siteIdCache;
}

function readLocal(key: string): PuckMap | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as PuckMap) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, map: PuckMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(map));
  } catch {
    /* best effort */
  }
}

export async function isSignedIn(): Promise<boolean> {
  try {
    const { data } = await getBrowserSupabase().auth.getSession();
    return !!data.session;
  } catch {
    return false;
  }
}

export async function loadPublished(): Promise<PuckMap | null> {
  try {
    const { data, error } = await getBrowserSupabase().rpc("site_public", { p_slug: SLUG });
    const puck = (data as { puck?: PuckMap } | null)?.puck;
    if (!error && puck) return puck;
  } catch {
    /* fall through */
  }
  return readLocal(PUBLISHED_KEY);
}

export async function loadDraft(): Promise<PuckMap | null> {
  const local = readLocal(DRAFT_KEY);
  if (local) return local;
  return loadPublished();
}

export async function saveDraft(map: PuckMap): Promise<SaveResult> {
  writeLocal(DRAFT_KEY, map);
  if (!(await isSignedIn())) return { ok: true, synced: false };
  const id = await siteId();
  if (!id) return { ok: false, error: "could not resolve site id", synced: false };
  try {
    const { error } = await getBrowserSupabase().rpc("save_content_draft", {
      p_site_id: id,
      p_patch: { puck: map },
    });
    return error ? { ok: false, error: error.message, synced: false } : { ok: true, synced: true };
  } catch (e) {
    return { ok: false, error: String(e), synced: false };
  }
}

export async function publish(map: PuckMap): Promise<SaveResult> {
  writeLocal(PUBLISHED_KEY, map);
  writeLocal(DRAFT_KEY, map);
  if (!(await isSignedIn())) return { ok: true, synced: false };
  const id = await siteId();
  if (!id) return { ok: false, error: "could not resolve site id", synced: false };
  try {
    const sb = getBrowserSupabase();
    const saved = await sb.rpc("save_content_draft", { p_site_id: id, p_patch: { puck: map } });
    if (saved.error) return { ok: false, error: saved.error.message, synced: false };
    const pub = await sb.rpc("publish_site", { p_site_id: id });
    return pub.error ? { ok: false, error: pub.error.message, synced: false } : { ok: true, synced: true };
  } catch (e) {
    return { ok: false, error: String(e), synced: false };
  }
}

export function resetDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* best effort */
  }
}


// ── Version history (draft & publish safety) ───────────────────────────────

export type SiteVersion = {
  version: number;
  published_at: string;
  published_by_email: string | null;
};

/** Published version history, newest first. Signed-in admin/owner only (RLS). */
export async function loadVersions(): Promise<SiteVersion[]> {
  const id = await siteId();
  if (!id) return [];
  try {
    const { data, error } = await getBrowserSupabase().rpc("list_site_versions", {
      p_site_id: id,
    });
    if (error || !data) return [];
    return data as SiteVersion[];
  } catch {
    return [];
  }
}

/**
 * Restore a past version INTO the draft (does not publish). Mirrors the restored
 * Puck map to localStorage so a reload resumes from it.
 */
export async function restoreVersion(
  version: number,
): Promise<{ ok: boolean; error?: string; data?: PuckMap }> {
  if (!(await isSignedIn())) return { ok: false, error: "Sign in to restore versions." };
  const id = await siteId();
  if (!id) return { ok: false, error: "could not resolve site id" };
  try {
    const { data, error } = await getBrowserSupabase().rpc("restore_site_version", {
      p_site_id: id,
      p_version: version,
    });
    if (error) return { ok: false, error: error.message };
    const map = (data as PuckMap | null) ?? undefined;
    if (map) writeLocal(DRAFT_KEY, map);
    return { ok: true, data: map };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

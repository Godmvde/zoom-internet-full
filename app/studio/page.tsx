"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Puck, Render, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "./studio-theme.css";
import { makeConfig } from "@/lib/puck/config";
import { seed } from "@/lib/puck/seed";
import { loadDraft, saveDraft, publish as publishMap, resetDraft } from "@/lib/puck/store";
import type { PuckMap } from "@/lib/puck/store";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import StudioImageEdit from "@/lib/puck/StudioImageEdit";
import StudioProseEdit from "@/lib/puck/StudioProseEdit";
import StudioDesignEdit from "@/lib/puck/StudioDesignEdit";
import StudioSectionTools from "@/lib/puck/StudioSectionTools";
import StudioLayout, { STUDIO_VIEWPORTS } from "@/lib/puck/StudioLayout";

// MULTI-PAGE Studio editor. State holds the whole PuckMap (route → doc); the
// top-bar page switcher swaps which route is edited (Puck remounts via a key
// that includes the route). The editor chrome is composed from Puck's own parts
// inside <StudioLayout>. Draft/publish persist through lib/puck/store.

const ROUTES = ["/", "/about", "/plans", "/contact", "/coverage"] as const;
type Route = (typeof ROUTES)[number];
const ROUTE_LABEL: Record<Route, string> = {
  "/": "Home",
  "/about": "About",
  "/plans": "Plans",
  "/contact": "Contact",
  "/coverage": "Coverage",
};
const STUDIO_PAGES = ROUTES.map((r) => ({ route: r, label: ROUTE_LABEL[r] }));

const renderConfig = makeConfig({ isAdmin: true });
const PREVIEW_W = { mobile: 390, tablet: 834, desktop: 1280, full: 0 } as const;
type PreviewDevice = keyof typeof PREVIEW_W;

function cloneSeed(): PuckMap {
  return JSON.parse(JSON.stringify(seed)) as PuckMap;
}

export default function StudioPage() {
  const [access, setAccess] = useState<"admin" | "client">("admin");
  const [previewing, setPreviewing] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("full");
  const [ready, setReady] = useState(false);
  const [ver, setVer] = useState(0);
  const [route, setRoute] = useState<Route>("/");
  const [data, setData] = useState<Data>(seed["/"]);
  const [status, setStatus] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "client" | null>(null);
  // A signed-in client's edit permissions, read from clients.edit_permissions.
  const [clientCaps, setClientCaps] = useState<Record<string, boolean> | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<PuckMap>(cloneSeed());
  const routeRef = useRef<Route>("/");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onFs = () => setIsFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const sb = getBrowserSupabase();
    async function resolveRole(session: { user?: { id: string; email?: string } } | null) {
      if (!session?.user) {
        setUserEmail(null);
        setRole(null);
        return;
      }
      setUserEmail(session.user.email ?? null);
      try {
        const { data } = await sb.from("profiles").select("role").eq("id", session.user.id).single();
        const isAdmin = (data as { role?: string } | null)?.role === "admin";
        setRole(isAdmin ? "admin" : "client");
        // A client's per-site edit permissions come from their client row.
        if (!isAdmin) {
          const { data: cl } = await sb
            .from("clients")
            .select("edit_permissions")
            .eq("owner_id", session.user.id)
            .maybeSingle();
          setClientCaps(
            ((cl as { edit_permissions?: Record<string, boolean> } | null)
              ?.edit_permissions) ?? {},
          );
        }
      } catch {
        setRole("client");
        setClientCaps({});
      }
    }
    sb.auth.getSession().then(({ data: s }) => resolveRole(s.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => resolveRole(s));
    let mounted = false;
    let applied = false;
    const mount = () => {
      if (!mounted) {
        mounted = true;
        setReady(true);
      }
    };
    const applyDraft = (draft: PuckMap | null) => {
      if (!applied) {
        applied = true;
        const base = cloneSeed();
        const merged: PuckMap = draft ? { ...base, ...draft } : base;
        mapRef.current = merged;
        setData(merged[routeRef.current] ?? base[routeRef.current]);
        if (draft) setStatus("Loaded your saved draft.");
        if (mounted) setVer((v) => v + 1);
      }
      mount();
    };
    loadDraft().then(applyDraft).catch(() => mount());
    const readyTimer = setTimeout(() => {
      if (!mounted) {
        setStatus("Slow connection — opened with defaults. Reload if your saved content is missing.");
        mount();
      }
    }, 6000);
    return () => {
      clearTimeout(readyTimer);
      sub.subscription.unsubscribe();
    };
  }, []);

  const effectiveAccess: "admin" | "client" = role === "client" ? "client" : access;

  // Resolve the caps this client may use. No-regression default: a client whose
  // permissions were never set (or only carried the legacy `layout` flag) keeps
  // the old behaviour — text, photos and contact editable. Once the admin sets
  // any content cap, we honour the switchboard exactly (unchecked = off).
  const CONTENT_CAPS = ["text", "photos", "contact", "theme", "products", "sections"] as const;
  const perms = clientCaps ?? {};
  const configured = CONTENT_CAPS.some((k) => k in perms);
  const effCaps: Record<string, boolean> = configured
    ? perms
    : { text: true, photos: true, contact: true, layout: !!perms.layout };

  const isAdminEditor = effectiveAccess === "admin";
  const canText = isAdminEditor || !!effCaps.text;
  const canPhotos = isAdminEditor || !!effCaps.photos;
  const canTheme = isAdminEditor || !!effCaps.theme;

  const config = isAdminEditor
    ? makeConfig({ isAdmin: true })
    : makeConfig({ caps: effCaps });

  const persist = useCallback(async (map: PuckMap) => {
    const r = await saveDraft(map);
    setStatus(
      r.synced
        ? "Draft saved to the live site."
        : r.ok
          ? "Saved locally — sign in to save to the live site."
          : "Draft save failed: " + r.error,
    );
  }, []);

  // Autosave: write the current route's doc into the map immediately (so route
  // switches never lose edits), then debounce persisting the whole map.
  const scheduleSave = useCallback(
    (d: Data) => {
      mapRef.current = { ...mapRef.current, [routeRef.current]: d };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(mapRef.current), 500);
    },
    [persist],
  );

  const switchRoute = useCallback((next: string) => {
    const r = next as Route;
    if (r === routeRef.current) return;
    routeRef.current = r;
    setRoute(r);
    setData(mapRef.current[r] ?? seed[r]);
  }, []);

  const switchAccess = useCallback((a: "admin" | "client") => {
    setData(mapRef.current[routeRef.current] ?? seed[routeRef.current]);
    setAccess(a);
  }, []);

  const doPublish = useCallback(async (d: Data) => {
    mapRef.current = { ...mapRef.current, [routeRef.current]: d };
    setStatus("Publishing…");
    const r = await publishMap(mapRef.current);
    setStatus(
      r.synced
        ? "Published to the live site ✓ (new version saved)."
        : r.ok
          ? "Saved locally. Sign in to publish to the live site."
          : "Publish failed: " + r.error,
    );
  }, []);

  const doReset = useCallback(() => {
    if (!confirm("Discard local edits and reset to the original content?")) return;
    resetDraft();
    const fresh = cloneSeed();
    mapRef.current = fresh;
    setData(fresh[routeRef.current]);
    setVer((v) => v + 1);
    setStatus("Reset to the original content.");
  }, []);

  const signIn = useCallback(async () => {
    setAuthBusy(true);
    setStatus("");
    const { error } = await getBrowserSupabase().auth.signInWithPassword({ email, password });
    setAuthBusy(false);
    if (error) setStatus("Sign-in failed: " + error.message);
    else {
      setPassword("");
      setStatus("Signed in — edits now save to the live site.");
    }
  }, [email, password]);

  const signOut = useCallback(async () => {
    await getBrowserSupabase().auth.signOut();
    setStatus("Signed out — editing locally only.");
  }, []);

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: "#0f1713",
        fontFamily: "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {!ready ? (
        <div style={{ padding: 24, color: "#9aa79b" }}>Loading editor…</div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <Puck
            key={route + "-" + effectiveAccess + "-" + ver}
            config={config}
            data={data}
            metadata={{ access: effectiveAccess }}
            viewports={STUDIO_VIEWPORTS}
            iframe={{ enabled: true }}
            onChange={scheduleSave}
            onPublish={doPublish}
          >
            <StudioLayout
              status={status}
              canAddSections={isAdminEditor}
              userEmail={userEmail}
              role={role}
              access={access}
              onSwitchAccess={switchAccess}
              onPublish={doPublish}
              onReset={doReset}
              onSignIn={signIn}
              onSignOut={signOut}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              authBusy={authBusy}
              isFull={isFull}
              onToggleFull={toggleFull}
              previewing={previewing}
              onPreviewChange={setPreviewing}
              pages={STUDIO_PAGES}
              currentRoute={route}
              onRoute={switchRoute}
            />
            <StudioImageEdit active={!previewing && canPhotos} />
            <StudioProseEdit active={!previewing && canText} />
            <StudioDesignEdit active={!previewing && canTheme} />
            <StudioSectionTools
              active={!previewing}
              canReorder={isAdminEditor || !!effCaps.layout}
              canAddRemove={isAdminEditor || !!effCaps.sections}
            />
          </Puck>

          {previewing && (
            <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "#0f1713", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: "1px solid #25382e", background: "#14211c", color: "#ece5d8", minHeight: 48 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Retiar <span style={{ color: "#9aa79b", fontWeight: 500 }}>Studio</span></span>
                <span style={{ width: 1, height: 20, background: "#25382e", margin: "0 4px" }} />
                <button
                  onClick={() => setPreviewing(false)}
                  style={{ height: 30, padding: "0 12px", borderRadius: 8, border: "1px solid #c79a4b", background: "#c79a4b", color: "#14211c", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >
                  ← Back to editing
                </button>
                <span style={{ color: "#9aa79b", fontSize: 13 }}>{ROUTE_LABEL[route]} ({route})</span>
                <span style={{ marginLeft: "auto" }} />
                {(["mobile", "tablet", "desktop", "full"] as PreviewDevice[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setPreviewDevice(d)}
                    style={{ height: 30, padding: "0 10px", borderRadius: 8, textTransform: "capitalize", border: "1px solid " + (previewDevice === d ? "#c79a4b" : "#25382e"), background: previewDevice === d ? "#c79a4b" : "transparent", color: previewDevice === d ? "#14211c" : "#c9d1c9", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                  >
                    {d === "full" ? "Full" : d}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", background: "#101a15", padding: previewDevice === "full" ? 0 : "16px 0" }}>
                <div style={{ width: PREVIEW_W[previewDevice] || "100%", maxWidth: "100%", background: "#fff", boxShadow: previewDevice === "full" ? "none" : "0 0 0 1px #25382e", minHeight: "100%" }}>
                  <Render config={renderConfig} data={data} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

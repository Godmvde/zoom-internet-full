"use client";

import { getBrowserSupabase } from "@/lib/supabase-browser";

// Shared client for Retiar's plan-gated AI endpoint. The Anthropic key + gate
// live in Retiar; here we just carry the signed-in session token across origins.

export const RETIAR_ORIGIN =
  process.env.NEXT_PUBLIC_RETIAR_ORIGIN || "https://retiar.vercel.app";
export const AI_ENDPOINT = `${RETIAR_ORIGIN}/api/ai`;

async function aiToken(): Promise<string | null> {
  try {
    const { data } = await getBrowserSupabase().auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

// Cheap capability probe — true only when this client's plan includes AI.
export async function probeAiEnabled(): Promise<boolean> {
  const token = await aiToken();
  if (!token) return false;
  try {
    const r = await fetch(AI_ENDPOINT, { headers: { authorization: `Bearer ${token}` } });
    if (!r.ok) return false;
    const j = await r.json();
    return Boolean(j.enabled);
  } catch {
    return false;
  }
}

// Richer probe: `enabled` (plan includes AI/design), `admin` (gates admin-only
// features like effects + animations).
export async function probeStudioAccess(): Promise<{ enabled: boolean; admin: boolean }> {
  const token = await aiToken();
  if (!token) return { enabled: false, admin: false };
  try {
    const r = await fetch(AI_ENDPOINT, { headers: { authorization: `Bearer ${token}` } });
    if (!r.ok) return { enabled: false, admin: false };
    const j = await r.json();
    return { enabled: Boolean(j.enabled), admin: Boolean(j.admin) };
  } catch {
    return { enabled: false, admin: false };
  }
}

export type AiBody = { action?: string; instruction?: string; text?: string };

export async function callAi(body: AiBody): Promise<{ text?: string; error?: string }> {
  const token = await aiToken();
  if (!token) return { error: "Please reload the editor to sign back in." };
  try {
    const r = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = (await r.json().catch(() => ({}))) as { text?: string; error?: string };
    if (!r.ok || !j.text) return { error: j.error || "AI couldn’t process that. Try again." };
    return { text: j.text };
  } catch {
    return { error: "Couldn’t reach the AI service. Check your connection." };
  }
}

// The current text selection inside the Puck canvas iframe (if any), plus a
// replace() that swaps it and tells Puck's inline editor to persist.
export function canvasSelection(): { text: string; replace: (s: string) => void } | null {
  const iframe = document.querySelector<HTMLIFrameElement>('[class*="PuckCanvas"] iframe, iframe');
  const doc = iframe?.contentDocument;
  const sel = doc?.getSelection();
  if (!doc || !sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const text = sel.toString();
  if (!text.trim()) return null;
  const range = sel.getRangeAt(0).cloneRange();
  const anchor = sel.anchorNode;
  const host = (
    anchor && (anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : (anchor as HTMLElement))
  )?.closest?.("[data-rtr-rich], [contenteditable]");
  const editable =
    (host?.querySelector<HTMLElement>("[contenteditable]") ?? (host as HTMLElement | null)) || null;
  return {
    text,
    replace: (s: string) => {
      const s2 = doc.getSelection();
      if (!s2) return;
      s2.removeAllRanges();
      s2.addRange(range);
      range.deleteContents();
      const node = doc.createTextNode(s);
      range.insertNode(node);
      const nr = doc.createRange();
      nr.selectNodeContents(node);
      s2.removeAllRanges();
      s2.addRange(nr);
      editable?.dispatchEvent(new InputEvent("input", { bubbles: true }));
    },
  };
}

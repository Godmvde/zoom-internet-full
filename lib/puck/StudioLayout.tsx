"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Puck, usePuck, type Data, type Viewport } from "@puckeditor/core";
import StudioAIPanel from "@/lib/puck/StudioAIPanel";
import { probeAiEnabled } from "@/lib/puck/ai";
import { loadVersions, restoreVersion, loadPublished, saveDraft, type SiteVersion } from "@/lib/puck/store";

// The Retiar Studio editor chrome, composed from Puck's own building blocks
// (Puck.Outline = layers, Puck.Preview = canvas, Puck.Fields = inspector) so the
// whole editor is one cohesive, dark, branded surface instead of Puck's default
// light chrome under a separate bar. Rendered as a CHILD of <Puck>, which gives
// it the editor context (usePuck: appState, dispatch, history, selection).

export type StudioChrome = {
  status: string;
  userEmail: string | null;
  role: "admin" | "client" | null;
  access: "admin" | "client";
  onSwitchAccess: (a: "admin" | "client") => void;
  onPublish: (d: Data) => void;
  onReset: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  email: string;
  setEmail: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  authBusy: boolean;
  isFull: boolean;
  onToggleFull: () => void;
  // Preview is a page-level clean <Render> view (Puck's own previewMode can't be
  // toggled reliably from a composed layout). The host owns the flag.
  previewing: boolean;
  onPreviewChange: (previewing: boolean) => void;
  // Multi-page sites pass their routes so the top bar can switch which page is
  // being edited. Single-page sites (like Falmouth) omit these.
  pages?: { route: string; label: string }[];
  currentRoute?: string;
  onRoute?: (route: string) => void;
  // Whether the current viewer may add/remove sections (admin, or a client with
  // the `sections` permission). Gates the "Add" tool. Defaults to admin-only.
  canAddSections?: boolean;
};

// Device presets for the edit canvas. Clean line icons (monitor / tablet /
// phone / full-width), matching the reference design.
function DeviceIcon({ kind }: { kind: string }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "desktop")
    return (
      <svg {...p}>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    );
  if (kind === "tablet")
    return (
      <svg {...p}>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    );
  if (kind === "mobile")
    return (
      <svg {...p}>
        <rect x="7" y="2" width="10" height="20" rx="2.5" />
        <path d="M11 18h2" />
      </svg>
    );
  // full width
  return (
    <svg {...p}>
      <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}
// Fixed widths — the canvas renders at these and zooms to fit, so the Desktop
// view always shows the desktop layout (never drops to mobile) on any screen.
const DEVICES: { key: string; label: string; width: number }[] = [
  { key: "desktop", label: "Desktop", width: 1280 },
  { key: "tablet", label: "Tablet", width: 834 },
  { key: "mobile", label: "Mobile", width: 390 },
];

export const STUDIO_VIEWPORTS: Viewport[] = [
  { width: 390, height: "auto", label: "Mobile", icon: "Smartphone" },
  { width: 834, height: "auto", label: "Tablet", icon: "Tablet" },
  { width: 1280, height: "auto", label: "Desktop", icon: "Monitor" },
];

// ── palette (Retiar dark green + gold) ─────────────────────────────────────
const C = {
  bg: "#0f1713",
  bar: "#14211c",
  panel: "#101a15",
  line: "#25382e",
  lineSoft: "#1a2a23",
  text: "#ece5d8",
  muted: "#9aa79b",
  gold: "#c79a4b",
  green: "#6bb39e",
  danger: "#c8674a",
};

function iconBtn(active: boolean, disabled = false) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 32,
    height: 30,
    padding: "0 9px",
    borderRadius: 8,
    border: "1px solid " + (active ? C.gold : C.line),
    background: active ? C.gold : "transparent",
    color: disabled ? "#5b6b60" : active ? C.bar : C.text,
    fontWeight: 600,
    fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    opacity: disabled ? 0.6 : 1,
  } as const;
}
function fmtWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
const SEP = { width: 1, height: 20, background: C.line, margin: "0 4px", flex: "none" } as const;
const INPUT = {
  padding: "5px 8px",
  border: "1px solid " + C.line,
  borderRadius: 6,
  fontSize: 13,
  background: C.lineSoft,
  color: C.text,
  width: 120,
  fontFamily: "inherit",
} as const;
const zoomBtn = {
  width: 28, height: 26, borderRadius: 7, border: "none", background: "transparent",
  color: C.text, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
} as const;
const menuBox = {
  position: "absolute" as const, top: "calc(100% + 8px)", right: 12, zIndex: 200,
  minWidth: 240, maxHeight: 460, overflow: "auto",
  background: C.lineSoft, border: "1px solid " + C.line, borderRadius: 12, padding: 14,
  boxShadow: "0 14px 36px rgba(0,0,0,.5)", display: "flex", flexDirection: "column" as const, gap: 12,
} as const;
const menuLabel = {
  fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const,
  letterSpacing: "0.08em", marginBottom: 6,
} as const;

// A tool-row pill (icon over label), matching the reference builder toolbar.
function ToolPill({ label, icon, active, soon, ai, onClick }: {
  label: string; icon: ReactNode; active?: boolean; soon?: boolean; ai?: boolean; onClick?: () => void;
}) {
  const idle = ai ? C.gold : C.text;
  return (
    <button
      onClick={soon ? undefined : onClick}
      disabled={soon}
      title={soon ? `${label} — coming soon` : label}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
        minWidth: 60, padding: "7px 10px", borderRadius: 10, flex: "none",
        border: "1px solid " + (active ? C.gold : "transparent"),
        background: active ? "rgba(199,154,75,0.14)" : "transparent",
        color: soon ? "#5b6b60" : active ? C.gold : idle,
        cursor: soon ? "default" : "pointer", opacity: soon ? 0.55 : 1,
        fontFamily: "inherit", fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap",
      }}
    >
      <span style={{ height: 18, display: "grid", placeItems: "center" }}>{icon}</span>
      {label}
    </button>
  );
}

// Small line icon used by the tool row.
function LineIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {d.split("|").map((path, i) => <path key={i} d={path} />)}
    </svg>
  );
}

export default function StudioLayout(props: StudioChrome) {
  const { appState, dispatch, history, config } = usePuck();
  const ui = appState.ui;
  const previewing = props.previewing;
  const isMulti = (props.pages?.length ?? 0) > 1;
  // Which tool flyout is open (replaces the old docked left rail).
  const [activeTool, setActiveTool] = useState<null | "add" | "ai" | "layers" | "pages">(null);
  const [inspectorTab, setInspectorTab] = useState<"design" | "settings" | "interactions">("settings");
  const [showMenu, setShowMenu] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null); // null = auto-fit
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<SiteVersion[] | null>(null);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  // Phone/narrow layout: the top bar wraps and the side panels become overlays
  // so the whole Studio stays usable on a small screen.
  const [isMobile, setIsMobile] = useState(false);

  // Re-probe whenever the signed-in identity changes. The handed-off session
  // (dashboard → embedded studio) lands a beat after mount, so a one-shot probe
  // on mount would run token-less and wrongly hide AI; keying on userEmail
  // re-checks the moment the session is recognised.
  useEffect(() => {
    let alive = true;
    probeAiEnabled().then((v) => {
      if (alive) setAiEnabled(v);
    });
    return () => {
      alive = false;
    };
  }, [props.userEmail]);

  // Dismiss the top-bar dropdowns (⋯ / account / history) when the user clicks
  // anywhere outside them — including inside the canvas iframe, whose clicks
  // never reach the parent document, so we bind a listener there too.
  const menuClusterRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!showMenu && !showAccount && !showHistory) return;
    const closeAll = () => { setShowMenu(false); setShowAccount(false); setShowHistory(false); };
    const onDocDown = (e: Event) => {
      const t = e.target;
      if (menuClusterRef.current && t instanceof Node && menuClusterRef.current.contains(t)) return;
      closeAll();
    };
    document.addEventListener("pointerdown", onDocDown, true);
    // Clicks inside a preview iframe don't reach the parent document, so bind the
    // dismiss there too. Bind to EVERY same-origin iframe's document rather than
    // guessing the first match — so a mis-ordered or unnamed canvas still closes
    // the menus when tapped.
    const docs: Document[] = [];
    document
      .querySelectorAll<HTMLIFrameElement>('[class*="PuckCanvas"] iframe, iframe')
      .forEach((f) => {
        const d = f.contentDocument;
        if (d && !docs.includes(d)) {
          d.addEventListener("pointerdown", closeAll, true);
          docs.push(d);
        }
      });
    return () => {
      document.removeEventListener("pointerdown", onDocDown, true);
      docs.forEach((d) => d.removeEventListener("pointerdown", closeAll, true));
    };
  }, [showMenu, showAccount, showHistory]);

  // Text-style focus bridge: StudioDesignEdit fires this when a text slot gains
  // focus. Pop the inspector open on the Design tab so its docked controls show,
  // even if the user never selected a section first.
  useEffect(() => {
    const onFocus = () => {
      setInspectorTab("design");
      dispatch({ type: "setUi", ui: { rightSideBarVisible: true } });
    };
    window.addEventListener("rtr-studio-text-focus", onFocus);
    return () => window.removeEventListener("rtr-studio-text-focus", onFocus);
  }, [dispatch]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 760);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // On a phone, start with both panels closed so the canvas is visible; they
  // open as overlays when toggled.
  useEffect(() => {
    if (isMobile) {
      dispatch({ type: "setUi", ui: { leftSideBarVisible: false, rightSideBarVisible: false } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Open on the Desktop view by default. Deferred a frame so the dispatch lands
  // after Puck's own mount (avoids an early-update warning).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      dispatch({
        type: "setUi",
        ui: (prev) => ({ viewports: { ...prev.viewports, current: { width: 1280, height: "auto" } } }),
      });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zoom the canvas to fit the available width, so the desktop layout is always
  // shown (scaled down) instead of collapsing to the mobile layout on a small
  // screen/embed.
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [previewing, ui.leftSideBarVisible, ui.rightSideBarVisible]);

  const curWidth = ui.viewports.current.width;
  const deviceW = typeof curWidth === "number" ? curWidth : 1280;
  const fitScale = canvasSize.w > 0 ? Math.min(1, (canvasSize.w - 24) / deviceW) : 1;
  // Manual zoom overrides auto-fit when set (null = fit to available width).
  const scale = zoom ?? fitScale;
  const setZoomBy = (delta: number) =>
    setZoom(Math.round((Math.min(2, Math.max(0.25, scale + delta))) * 100) / 100);

  function setUi(patch: Record<string, unknown>) {
    dispatch({ type: "setUi", ui: patch });
  }
  function setDevice(width: number | "100%") {
    setUi({ viewports: { ...ui.viewports, current: { width, height: "auto" } } });
  }
  function toggleRight() {
    setUi({ rightSideBarVisible: !ui.rightSideBarVisible });
  }
  const focusMode = !activeTool && !ui.rightSideBarVisible && !previewing;
  function toggleFocus() {
    if (focusMode) {
      setUi({ rightSideBarVisible: true });
    } else {
      setActiveTool(null);
      setUi({ rightSideBarVisible: false });
    }
  }

  const locked = props.role === "client";

  // Undo/redo without changing which device view you're on: Puck's history can
  // carry the viewport, so we re-assert the current one right after.
  function undoKeepView() {
    if (!history.hasPast) return;
    const vp = ui.viewports.current;
    history.back();
    requestAnimationFrame(() =>
      dispatch({ type: "setUi", ui: (prev) => ({ viewports: { ...prev.viewports, current: vp } }) }),
    );
  }
  function redoKeepView() {
    if (!history.hasFuture) return;
    const vp = ui.viewports.current;
    history.forward();
    requestAnimationFrame(() =>
      dispatch({ type: "setUi", ui: (prev) => ({ viewports: { ...prev.viewports, current: vp } }) }),
    );
  }

  // ── Version history (draft & publish safety) ──────────────────────────────
  async function openHistory() {
    const next = !showHistory;
    setShowHistory(next);
    setShowMenu(false);
    if (next) {
      setVersions(null);
      setVersions(await loadVersions());
    }
  }
  async function doRestore(version: number) {
    if (
      !window.confirm(
        `Restore version ${version} into your draft? Your current unpublished changes will be replaced — you can review it, then Publish to make it live.`,
      )
    )
      return;
    setHistoryBusy(true);
    const r = await restoreVersion(version);
    if (!r.ok) {
      setHistoryBusy(false);
      window.alert("Restore failed: " + (r.error ?? "unknown error"));
      return;
    }
    // The restored version is now the saved draft (DB + local). Reload so the
    // editor re-initialises from it cleanly — works for single- and multi-page.
    window.location.reload();
  }
  async function doDiscard() {
    if (
      !window.confirm(
        "Discard your unpublished changes and go back to the last published version?",
      )
    )
      return;
    setHistoryBusy(true);
    const pub = await loadPublished();
    if (pub) await saveDraft(pub);
    window.location.reload();
  }

  return (
    <div
      className="rtr-studio"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(55% 45% at 12% 0%, rgba(107,179,158,0.14), transparent 60%), radial-gradient(50% 40% at 100% 15%, rgba(45,90,74,0.28), transparent 60%), #0b1310",
        color: C.text,
        fontFamily: "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 90, // keep the bar (and its Settings/History dropdowns) above the canvas + panels
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: isMobile ? "wrap" : "nowrap",
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          minHeight: 48,
        }}
      >
        {/* LEFT — device switcher (segmented) */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, padding: 3, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid " + C.line, flex: "none" }}>
          {DEVICES.map((d) => {
            const on = curWidth === d.width;
            return (
              <button key={d.key} onClick={() => setDevice(d.width)} title={d.label}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 28, borderRadius: 7, border: "none", cursor: "pointer", background: on ? C.gold : "transparent", color: on ? C.bar : C.muted }}>
                <DeviceIcon kind={d.key} />
              </button>
            );
          })}
        </div>

        {/* Zoom */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: 2, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid " + C.line, flex: "none" }}>
          <button onClick={() => setZoomBy(-0.1)} title="Zoom out" style={zoomBtn}>−</button>
          <button onClick={() => setZoom(null)} title={zoom === null ? "Fit to width" : "Reset to fit"}
            style={{ ...zoomBtn, width: 52, fontVariantNumeric: "tabular-nums", color: zoom === null ? C.muted : C.text }}>
            {Math.round(scale * 100)}%
          </button>
          <button onClick={() => setZoomBy(0.1)} title="Zoom in" style={zoomBtn}>+</button>
        </div>

        <span style={SEP} />
        {/* Undo / redo */}
        <button onClick={undoKeepView} disabled={!history.hasPast} style={iconBtn(false, !history.hasPast)} title="Undo">↶</button>
        <button onClick={redoKeepView} disabled={!history.hasFuture} style={iconBtn(false, !history.hasFuture)} title="Redo">↷</button>

        <span style={{ marginLeft: "auto", flex: "none" }} />

        {/* RIGHT — preview · publish · live · ⋯ · account */}
        <button onClick={() => props.onPreviewChange(!previewing)} style={{ ...iconBtn(previewing), padding: "0 14px" }} title="Preview the site">
          {previewing ? "Editing" : "Preview"}
        </button>
        <button onClick={() => props.onPublish(appState.data as Data)}
          style={{ ...iconBtn(false), background: C.gold, color: C.bar, borderColor: C.gold, fontWeight: 700, padding: "0 16px", gap: 7 }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>↗</span> Publish
        </button>
        <a href="/" target="_blank" rel="noopener noreferrer" title="Open the live site in a new tab" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 11px", borderRadius: 999, border: "1px solid " + (props.userEmail ? "rgba(107,179,158,.35)" : C.line), background: props.userEmail ? "rgba(107,179,158,.10)" : "transparent", color: props.userEmail ? C.green : C.muted, fontSize: 12.5, fontWeight: 600, flex: "none", textDecoration: "none", cursor: "pointer" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: props.userEmail ? C.green : C.muted, boxShadow: props.userEmail ? "0 0 7px rgba(107,179,158,.8)" : "none" }} />
          {props.userEmail ? "Live ↗" : "Local"}
        </a>
        <span ref={menuClusterRef} style={{ display: "contents" }}>
        <button onClick={() => { setShowMenu((s) => !s); setShowAccount(false); setShowHistory(false); }} style={iconBtn(showMenu)} title="More">⋯</button>
        <button onClick={() => { setShowAccount((s) => !s); setShowMenu(false); setShowHistory(false); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 32, padding: "0 6px 0 4px", borderRadius: 999, border: "1px solid " + C.line, background: showAccount ? "rgba(255,255,255,0.06)" : "transparent", cursor: "pointer", color: C.text, flex: "none" }} title="Account">
          <span style={{ width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center", background: props.userEmail ? "rgba(199,154,75,.2)" : "rgba(255,255,255,0.06)", color: C.gold, fontSize: 11, fontWeight: 700 }}>
            {(props.userEmail || "?").slice(0, 1).toUpperCase()}
          </span>
          <span style={{ fontSize: 11, color: C.muted }}>▾</span>
        </button>

        {/* ⋯ menu — panels, access, history, reset */}
        {showMenu && (
          <div className="rtr-scroll" style={menuBox}>
            {props.pages && props.pages.length > 1 && (
              <div>
                <div style={menuLabel}>Page</div>
                <select value={props.currentRoute} onChange={(e) => props.onRoute?.(e.target.value)} style={{ ...INPUT, width: "100%", cursor: "pointer" }}>
                  {props.pages.map((p) => <option key={p.route} value={p.route}>{p.label}</option>)}
                </select>
              </div>
            )}
            <div>
              <div style={menuLabel}>Panels</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button onClick={toggleRight} style={iconBtn(ui.rightSideBarVisible)}>Inspector</button>
                <button onClick={toggleFocus} style={iconBtn(focusMode)}>Focus</button>
                <button onClick={props.onToggleFull} style={iconBtn(props.isFull)}>{props.isFull ? "Exit full" : "Full screen"}</button>
              </div>
            </div>
            <div style={{ borderTop: "1px solid " + C.line, paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {props.userEmail && (
                <button onClick={() => { setShowMenu(false); openHistory(); }} style={{ ...iconBtn(false), justifyContent: "flex-start" }}>Version history</button>
              )}
              <button onClick={props.onReset} style={{ ...iconBtn(false), color: C.danger, borderColor: "rgba(200,103,74,.4)", justifyContent: "flex-start" }}>Reset to original</button>
            </div>
          </div>
        )}

        {/* Account menu */}
        {showAccount && (
          <div style={{ ...menuBox, minWidth: 260 }}>
            {props.userEmail ? (
              <>
                <div>
                  <div style={menuLabel}>Signed in</div>
                  <div style={{ fontSize: 12.5, color: C.text, wordBreak: "break-all" }}>{props.userEmail}</div>
                </div>
                <button onClick={props.onSignOut} style={{ ...iconBtn(false), justifyContent: "flex-start" }}>Sign out</button>
              </>
            ) : (
              <>
                <div style={menuLabel}>Sign in to save &amp; publish</div>
                <input type="email" placeholder="email" value={props.email} onChange={(e) => props.setEmail(e.target.value)} style={{ ...INPUT, width: "100%" }} />
                <input type="password" placeholder="password" value={props.password} onChange={(e) => props.setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && props.onSignIn()} style={{ ...INPUT, width: "100%" }} />
                <button onClick={props.onSignIn} disabled={props.authBusy} style={{ ...iconBtn(false), background: C.gold, color: C.bar, borderColor: C.gold, fontWeight: 700 }}>{props.authBusy ? "…" : "Sign in"}</button>
              </>
            )}
          </div>
        )}

        {showHistory && (
          <div
            className="rtr-scroll"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 12,
              zIndex: 200,
              width: 320,
              maxHeight: 440,
              overflow: "auto",
              background: C.lineSoft,
              border: "1px solid " + C.line,
              borderRadius: 10,
              padding: 14,
              boxShadow: "0 12px 34px rgba(0,0,0,.5)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Version history
            </div>
            <button
              onClick={doDiscard}
              disabled={historyBusy}
              style={{ ...iconBtn(false), color: C.danger, borderColor: "rgba(200,103,74,.4)", justifyContent: "flex-start" }}
              title="Revert your unpublished draft to the last published version"
            >
              Discard unpublished changes
            </button>
            <div style={{ borderTop: "1px solid " + C.line, paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {versions === null ? (
                <div style={{ fontSize: 12.5, color: C.muted }}>Loading…</div>
              ) : versions.length === 0 ? (
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
                  No saved versions yet. Each time you Publish, a restore point is saved here.
                </div>
              ) : (
                versions.map((v, i) => (
                  <div
                    key={v.version}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, border: "1px solid " + C.line, background: "rgba(255,255,255,0.02)" }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        Version {v.version}
                        {i === 0 && <span style={{ marginLeft: 6, fontSize: 10.5, color: C.green, fontWeight: 700 }}>● LIVE</span>}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {fmtWhen(v.published_at)}
                        {v.published_by_email ? " · " + v.published_by_email : ""}
                      </div>
                    </div>
                    <button onClick={() => doRestore(v.version)} disabled={historyBusy} style={{ ...iconBtn(false), flex: "none" }}>
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        </span>
      </div>

      {/* ── Status strip ────────────────────────────────────────────── */}
      <div style={{ padding: "5px 12px", borderBottom: "1px solid " + C.lineSoft, fontSize: 12.5, color: C.muted, background: C.panel, flex: "none" }}>
        {props.status ||
          (previewing
            ? "Preview — click around; this is how visitors see it."
            : locked
              ? "Editing your text and photos. Layout is locked."
              : props.userEmail
                ? "Signed in — Publish pushes to the live site."
                : "Editing locally. Sign in (top-right) to save & publish.")}
      </div>

      {/* ── Tool row (replaces the docked left rail) ────────────────── */}
      {!previewing && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderBottom: "1px solid " + C.lineSoft, background: C.panel, flex: "none", overflowX: "auto" }}>
          {(props.canAddSections ?? !locked) && (
            <ToolPill label="Add" active={activeTool === "add"} onClick={() => setActiveTool((t) => (t === "add" ? null : "add"))}
              icon={<LineIcon d="M12 5v14|M5 12h14" />} />
          )}
          {aiEnabled && (
            <ToolPill label="Retiar AI" ai active={activeTool === "ai"} onClick={() => setActiveTool((t) => (t === "ai" ? null : "ai"))}
              icon={<svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M16 2 L30 16 L16 30 L2 16 Z" opacity="0.6" /><path d="M16 2 L16 30 M2 16 L30 16" /><circle cx="16" cy="16" r="2" fill="currentColor" /></svg>} />
          )}
          <ToolPill label="Layers" active={activeTool === "layers"} onClick={() => setActiveTool((t) => (t === "layers" ? null : "layers"))}
            icon={<LineIcon d="M12 3l9 5-9 5-9-5z|M3 13l9 5 9-5" />} />
          {isMulti && (
            <ToolPill label="Pages" active={activeTool === "pages"} onClick={() => setActiveTool((t) => (t === "pages" ? null : "pages"))}
              icon={<LineIcon d="M6 3h9l3 3v15H6z|M9 8h6M9 12h6M9 16h4" />} />
          )}
        </div>
      )}

      {/* ── Body: canvas · tool flyout · right inspector ────────────── */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", position: "relative" }}>
        {/* Tool flyout — floats over the canvas from the left */}
        {activeTool && !previewing && (
          <div style={{
            width: activeTool === "ai" ? "min(88vw, 340px)" : "min(88vw, 300px)",
            flex: "none",
            position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 85,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(11,19,16,0.97)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            display: "flex", flexDirection: "column", minHeight: 0,
            boxShadow: "0 12px 44px rgba(0,0,0,.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid " + C.lineSoft }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>
                {activeTool === "ai" ? "Retiar AI" : activeTool === "add" ? "Add a section" : activeTool === "layers" ? "Layers" : "Pages"}
              </span>
              <button onClick={() => setActiveTool(null)} title="Close" style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {activeTool === "ai" ? (
                <StudioAIPanel />
              ) : activeTool === "add" ? (
                <div className="rtr-scroll" style={{ flex: 1, overflow: "auto", minHeight: 0, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 11, color: C.muted, padding: "2px 4px 6px" }}>Tap a block to add it to the bottom of the page.</div>
                  {Object.entries(config.components).map(([type, comp]) => {
                    const label = (comp as { label?: string })?.label || type;
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          dispatch({
                            type: "insert",
                            componentType: type,
                            destinationIndex: appState.data.content?.length ?? 0,
                            destinationZone: "root:default-zone",
                          });
                          setActiveTool(null);
                        }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                          textAlign: "left", padding: "11px 12px", borderRadius: 10, cursor: "pointer",
                          border: "1px solid " + C.line, background: "rgba(255,255,255,0.02)",
                          color: C.text, fontSize: 13, fontFamily: "inherit",
                        }}
                      >
                        <span>{label}</span>
                        <span style={{ color: C.gold, fontSize: 17, lineHeight: 1 }}>+</span>
                      </button>
                    );
                  })}
                </div>
              ) : activeTool === "layers" ? (
                <div className="rtr-scroll" style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                  <Puck.Outline />
                </div>
              ) : (
                <div className="rtr-scroll" style={{ flex: 1, overflow: "auto", minHeight: 0, padding: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                  {props.pages?.map((p) => {
                    const active = props.currentRoute === p.route;
                    return (
                      <button
                        key={p.route}
                        onClick={() => props.onRoute?.(p.route)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, textAlign: "left",
                          padding: "9px 10px", borderRadius: 8, cursor: "pointer",
                          border: "1px solid " + (active ? C.gold : "transparent"),
                          background: active ? "rgba(199,154,75,.14)" : "transparent",
                          color: active ? C.gold : C.text, fontSize: 13, fontWeight: active ? 700 : 500,
                          fontFamily: "inherit",
                        }}
                      >
                        <span style={{ opacity: 0.7 }}>▢</span>
                        <span style={{ flex: 1 }}>{p.label}</span>
                        <span style={{ fontSize: 11, color: C.muted }}>{p.route}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canvas — renders at the device's fixed width and zooms to fit, so the
            Desktop view always shows the desktop layout (scaled), never the
            mobile layout, regardless of the actual screen/embed size. */}
        <div
          ref={canvasRef}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            background: C.panel,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            padding: "12px 0",
          }}
        >
          <div
            style={{
              width: deviceW,
              flex: "none",
              height: canvasSize.h > 0 ? (canvasSize.h - 24) / scale : "100%",
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              background: "#fff",
              boxShadow: "0 0 0 1px " + C.line,
              overflow: "hidden",
            }}
          >
            <Puck.Preview />
          </div>
        </div>

        {/* Right inspector — tabbed (Design / Settings / Interactions) */}
        {ui.rightSideBarVisible && !previewing && (
          <div style={{
            width: isMobile ? "min(88vw, 320px)" : 300,
            flex: "none",
            ...(isMobile ? { position: "absolute" as const, right: 0, top: 0, bottom: 0, zIndex: 85, boxShadow: "0 12px 40px rgba(0,0,0,.55)" } : {}),
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            background: isMobile ? "rgba(11,19,16,0.97)" : "rgba(18,29,24,0.66)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            display: "flex", flexDirection: "column", minHeight: 0,
          }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, padding: "10px 12px 0", flex: "none" }}>
              {(["design", "settings", "interactions"] as const).map((t) => {
                const on = inspectorTab === t;
                return (
                  <button key={t} onClick={() => setInspectorTab(t)}
                    style={{ flex: 1, padding: "7px 6px", borderRadius: 8, cursor: "pointer",
                      background: on ? "rgba(199,154,75,0.16)" : "transparent",
                      color: on ? C.gold : C.muted,
                      border: "1px solid " + (on ? "rgba(199,154,75,0.45)" : "transparent"),
                      fontFamily: "inherit", fontSize: 12.5, fontWeight: on ? 700 : 500, textTransform: "capitalize" }}>
                    {t}
                  </button>
                );
              })}
            </div>
            <div style={{ height: 1, background: C.lineSoft, flex: "none" }} />

            {/* Content */}
            <div className="rtr-scroll" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              {/* Settings = Puck's own fields. Design / Interactions = docking
                  slots that StudioDesignEdit portals its live controls into when
                  a text element is focused; empty state shows the data-hint. */}
              {inspectorTab === "settings" && <Puck.Fields />}
              <style>{`.rtr-inspector-slot:empty::before{content:attr(data-hint);display:block;padding:22px 18px;color:${C.muted};font-size:12px;line-height:1.55;text-align:center;}`}</style>
              <div
                id="rtr-slot-design"
                className="rtr-inspector-slot"
                data-hint="Tap any text on your site — its font, size, colour, alignment and shadow controls open right here."
                style={{ display: inspectorTab === "design" ? "block" : "none" }}
              />
              <div
                id="rtr-slot-interactions"
                className="rtr-inspector-slot"
                data-hint="Tap any text on your site, then add hover, scroll and page-load animations here."
                style={{ display: inspectorTab === "interactions" ? "block" : "none" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

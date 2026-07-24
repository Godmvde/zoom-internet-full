"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePuck, type Data } from "@puckeditor/core";
import { probeStudioAccess } from "@/lib/puck/ai";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { GOOGLE_FONTS, FONT_GROUPS, fontPreviewUrls, type ElementStyles, type SlotStyle, type HoverFx, type PressFx, type LoopFx, type ScrollFx, type AppearFx } from "@/lib/puck/elementStyles";

// The per-element design inspector. When a text slot (any [data-rtr-field="ov:…"])
// is focused in the canvas, its full typography / effects controls appear.
//
// Two presentations, one engine:
//  • Docked — when the right inspector is open (a section is selected), the
//    controls portal straight into its "Design" tab (typography) and
//    "Interactions" tab (effects). No second window, no per-site page edits.
//  • Floating — when the inspector is closed, a movable "Text style" panel
//    appears over the canvas as a fallback.
// Changes write to Puck data at root.props.elementStyles; the config's
// root.render turns that into CSS live in the canvas AND on the published site.
// Design (typography) is available on every plan (gated only by the theme
// permission via `active`); the Effects/Interactions layer stays admin-only.

const C = {
  bar: "#14211c",
  panel: "#101a15",
  line: "#25382e",
  lineSoft: "#1a2a23",
  text: "#ece5d8",
  muted: "#9aa79b",
  gold: "#c79a4b",
};

const WEIGHTS = [300, 400, 500, 600, 700, 800, 900];

// Puck types root.props narrowly ({ title? }); we store our design layer there
// too. Index signature preserves any other root props on merge.
type DesignRootProps = { elementStyles?: ElementStyles; fonts?: string[]; [k: string]: unknown };

function fieldLabel(key: string): string {
  const raw = key.replace(/^ov:/, "").replace(/\./g, " · ");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function StudioDesignEdit({ active }: { active: boolean }) {
  const { appState, dispatch } = usePuck();
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<"style" | "effects">("style");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [fontQuery, setFontQuery] = useState("");
  // Which inspector docking slots exist right now (present only while the right
  // panel is open). Null on both ⇒ fall back to the floating panel.
  const [slots, setSlots] = useState<{ design: HTMLElement | null; fx: HTMLElement | null }>({ design: null, fx: null });

  // Drag-to-resize the whole floating panel (touch-friendly). Right-anchored, so
  // dragging the bottom-left grip outward grows it wider (leftward) and taller.
  const panelRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number | null }>({ w: 268, h: null });
  const drag = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const onHandleDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const h = panelRef.current?.offsetHeight ?? 400;
    drag.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h ?? h };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
  };
  const onHandleMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const maxW = Math.max(280, window.innerWidth - 24);
    const maxH = Math.max(260, window.innerHeight - 108);
    const w = Math.min(maxW, Math.max(240, drag.current.w + (drag.current.x - e.clientX)));
    const h = Math.min(maxH, Math.max(220, drag.current.h + (e.clientY - drag.current.y)));
    setSize({ w, h });
  };
  const onHandleUp = (e: React.PointerEvent) => {
    drag.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  // Design (typography) is available on every plan; only the Effects/Interactions
  // layer is admin-only, so we just need the admin flag here. Re-probe on auth
  // change so a handed-off session (dashboard → embedded studio) that lands a
  // beat after mount doesn't leave an admin stuck without Effects.
  useEffect(() => {
    let alive = true;
    const run = () => probeStudioAccess().then((a) => { if (alive) setIsAdmin(a.admin); });
    run();
    const { data: sub } = getBrowserSupabase().auth.onAuthStateChange(() => run());
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load the picker's preview fonts once (editor only) so each name renders in
  // its own typeface. Deduped via a marker element in <head>.
  useEffect(() => {
    const id = "rtr-font-preview";
    if (document.getElementById(id)) return;
    fontPreviewUrls(GOOGLE_FONTS).forEach((href, i) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute("data-rtr-font-preview", String(i));
      document.head.appendChild(link);
    });
    const marker = document.createElement("meta");
    marker.id = id;
    document.head.appendChild(marker);
  }, []);

  // Poll for the inspector docking slots so we can portal into them the moment
  // the right panel opens (and drop back to floating when it closes). Runs even
  // before access resolves, so the tab can show a precise status.
  useEffect(() => {
    if (!active) return;
    const check = () =>
      setSlots((prev) => {
        const design = document.getElementById("rtr-slot-design");
        const fx = document.getElementById("rtr-slot-interactions");
        if (prev.design === design && prev.fx === fx) return prev;
        return { design, fx };
      });
    check();
    const id = window.setInterval(check, 350);
    return () => window.clearInterval(id);
  }, [active]);

  // When a text slot gains focus, ask the chrome to pop the inspector open on the
  // Design tab — so the docked controls show even if no section was selected.
  useEffect(() => {
    if (activeKey) window.dispatchEvent(new CustomEvent("rtr-studio-text-focus"));
  }, [activeKey]);

  // Watch the canvas iframe: when focus/selection lands inside an editable text
  // slot, make it the active target.
  useEffect(() => {
    if (!active) {
      setActiveKey(null);
      return;
    }
    let stop = false;
    let boundDoc: Document | null = null;
    const iframe = () =>
      document.querySelector<HTMLIFrameElement>('[class*="PuckCanvas"] iframe, iframe');

    function onFocusOrSelect() {
      const doc = boundDoc;
      if (!doc) return;
      const sel = doc.getSelection();
      const node =
        (sel && sel.anchorNode) ||
        (doc.activeElement as Node | null);
      const el =
        node && (node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement));
      const host = el?.closest?.('[data-rtr-field^="ov:"]') as HTMLElement | null;
      if (host) setActiveKey(host.getAttribute("data-rtr-field"));
    }

    function detach(doc: Document | null) {
      if (!doc) return;
      doc.removeEventListener("focusin", onFocusOrSelect, true);
      doc.removeEventListener("selectionchange", onFocusOrSelect);
      doc.removeEventListener("click", onFocusOrSelect, true);
    }
    function arm() {
      if (stop) return;
      const doc = iframe()?.contentDocument ?? null;
      if (!doc || doc === boundDoc) return;
      // Detach from the previous document before binding the new one, so
      // listeners don't accumulate each time the canvas iframe reloads (e.g. on
      // a viewport/device switch).
      detach(boundDoc);
      boundDoc = doc;
      doc.addEventListener("focusin", onFocusOrSelect, true);
      doc.addEventListener("selectionchange", onFocusOrSelect);
      doc.addEventListener("click", onFocusOrSelect, true);
    }
    arm();
    const id = window.setInterval(arm, 300);
    return () => {
      stop = true;
      window.clearInterval(id);
      detach(boundDoc);
    };
  }, [active]);

  const rootProps = (appState.data.root?.props ?? {}) as DesignRootProps;
  const style: SlotStyle = (activeKey && rootProps.elementStyles?.[activeKey]) || {};

  // Merge a style patch for the active slot into root props and persist.
  const patch = useCallback(
    (p: Partial<SlotStyle>) => {
      if (!activeKey) return;
      dispatch({
        type: "setData",
        recordHistory: true, // so the ↶ undo button reverts design/font changes
        data: ((prev: Data) => {
          const rp = (prev.root?.props ?? {}) as DesignRootProps;
          const nextStyle = { ...(rp.elementStyles?.[activeKey] || {}), ...p };
          const elementStyles = { ...(rp.elementStyles || {}), [activeKey]: nextStyle };
          const fonts = new Set(rp.fonts || []);
          if (p.fontFamily) fonts.add(p.fontFamily);
          return {
            ...prev,
            root: { ...prev.root, props: { ...rp, elementStyles, fonts: [...fonts] } },
          };
        }) as unknown as Partial<Data>,
      });
    },
    [activeKey, dispatch],
  );

  const clearSlot = useCallback(() => {
    if (!activeKey) return;
    dispatch({
      type: "setData",
      recordHistory: true,
      data: ((prev: Data) => {
        const rp = (prev.root?.props ?? {}) as DesignRootProps;
        const elementStyles = { ...(rp.elementStyles || {}) };
        delete elementStyles[activeKey];
        return { ...prev, root: { ...prev.root, props: { ...rp, elementStyles } } };
      }) as unknown as Partial<Data>,
    });
  }, [activeKey, dispatch]);

  const fontMatches = useMemo(() => {
    const q = fontQuery.trim().toLowerCase();
    if (!q) return GOOGLE_FONTS;
    return GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(q));
  }, [fontQuery]);

  if (!active) return null;

  const shadow = style.textShadow;

  // A small "you're editing X" header shown at the top of the docked controls.
  const dockHeader = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "12px 12px 0" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>Editing</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeKey ? fieldLabel(activeKey) : ""}</div>
      </div>
      <button onClick={() => setActiveKey(null)} title="Done" style={{ flex: "none", background: "transparent", border: "1px solid " + C.line, borderRadius: 7, color: C.muted, cursor: "pointer", fontSize: 11.5, padding: "4px 9px", fontFamily: "inherit" }}>Done</button>
    </div>
  );

  // ── Typography controls (Design tab / floating Style tab) ──────────────────
  const styleControls = (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Font — grouped by style, each name shown in its own typeface, searchable */}
      <Group label="Font">
        <input
          value={fontQuery}
          onChange={(e) => setFontQuery(e.target.value)}
          placeholder={style.fontFamily ? `Current: ${style.fontFamily}` : "Search fonts…"}
          style={inp}
        />
        <div className="rtr-scroll" style={{ maxHeight: 220, overflow: "auto", marginTop: 6, border: "1px solid " + C.line, borderRadius: 8 }}>
          {!fontQuery.trim() && (
            <button onMouseDown={(e) => { e.preventDefault(); patch({ fontFamily: undefined }); }} style={fontRowStyle(!style.fontFamily, "inherit")}>
              Default (site font)
            </button>
          )}
          {fontQuery.trim() ? (
            fontMatches.length ? (
              fontMatches.map((f) => (
                <button key={f} onMouseDown={(e) => { e.preventDefault(); patch({ fontFamily: f }); }} style={fontRowStyle(style.fontFamily === f, `'${f}', sans-serif`)}>{f}</button>
              ))
            ) : (
              <button onMouseDown={(e) => { e.preventDefault(); patch({ fontFamily: fontQuery.trim() }); }} style={fontRowStyle(false, "inherit")}>Use “{fontQuery.trim()}”</button>
            )
          ) : (
            FONT_GROUPS.map((g) => (
              <div key={g.category}>
                <div style={{ position: "sticky", top: 0, background: C.bar, color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 10px", borderBottom: "1px solid " + C.lineSoft, zIndex: 1 }}>{g.category}</div>
                {g.fonts.map((f) => (
                  <button key={f} onMouseDown={(e) => { e.preventDefault(); patch({ fontFamily: f }); }} style={fontRowStyle(style.fontFamily === f, `'${f}', sans-serif`)}>{f}</button>
                ))}
              </div>
            ))
          )}
        </div>
      </Group>

      {/* Weight + Size */}
      <div style={{ display: "flex", gap: 8 }}>
        <Group label="Weight" flex>
          <select value={style.fontWeight ?? ""} onChange={(e) => patch({ fontWeight: e.target.value ? Number(e.target.value) : undefined })} style={inp}>
            <option value="">Default</option>
            {WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </Group>
        <Group label="Size (px)" flex>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button onClick={() => patch({ fontSize: Math.max(1, (style.fontSize ?? 16) - 1) })} style={stepBtn} title="Smaller">−</button>
            <input type="number" value={style.fontSize ?? ""} onChange={(e) => patch({ fontSize: e.target.value ? Number(e.target.value) : undefined })} placeholder="—" style={{ ...inp, textAlign: "center" }} />
            <button onClick={() => patch({ fontSize: (style.fontSize ?? 16) + 1 })} style={stepBtn} title="Bigger">+</button>
          </div>
        </Group>
      </div>

      {/* Line height + Letter spacing */}
      <div style={{ display: "flex", gap: 8 }}>
        <Group label="Line height" flex>
          <input type="number" step="0.05" value={style.lineHeight ?? ""} onChange={(e) => patch({ lineHeight: e.target.value ? Number(e.target.value) : undefined })} placeholder="—" style={inp} />
        </Group>
        <Group label="Letter sp. (px)" flex>
          <input type="number" step="0.5" value={style.letterSpacing ?? ""} onChange={(e) => patch({ letterSpacing: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="—" style={inp} />
        </Group>
      </div>

      {/* Color */}
      <Group label="Color">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="color" value={style.color || "#ffffff"} onChange={(e) => patch({ color: e.target.value })} style={{ width: 34, height: 30, padding: 0, border: "1px solid " + C.line, borderRadius: 6, background: "transparent", cursor: "pointer" }} />
          <input value={style.color || ""} onChange={(e) => patch({ color: e.target.value || undefined })} placeholder="#ffffff" style={{ ...inp, flex: 1 }} />
        </div>
      </Group>

      {/* Alignment */}
      <Group label="Alignment">
        <div style={{ display: "flex", gap: 4 }}>
          {(["left", "center", "right"] as const).map((a) => (
            <button key={a} onClick={() => patch({ textAlign: style.textAlign === a ? undefined : a })} style={{ ...alignBtn, ...(style.textAlign === a ? chipActive : {}) }} title={a}>
              {a === "left" ? "⇤" : a === "center" ? "↔" : "⇥"}
            </button>
          ))}
        </div>
      </Group>

      {/* Text shadow */}
      <Group label="Text shadow">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={!!shadow} onChange={(e) => patch({ textShadow: e.target.checked ? { x: 0, y: 2, blur: 8, color: "rgba(0,0,0,0.4)" } : null })} />
          <span style={{ color: C.muted }}>{shadow ? "On" : "Off"}</span>
        </label>
        {shadow && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <SmallNum label="X" value={shadow.x} onChange={(x) => patch({ textShadow: { ...shadow, x } })} />
              <SmallNum label="Y" value={shadow.y} onChange={(y) => patch({ textShadow: { ...shadow, y } })} />
              <SmallNum label="Blur" value={shadow.blur} onChange={(blur) => patch({ textShadow: { ...shadow, blur } })} />
            </div>
            <input type="color" value={hexOf(shadow.color)} onChange={(e) => patch({ textShadow: { ...shadow, color: e.target.value } })} style={{ width: "100%", height: 28, padding: 0, border: "1px solid " + C.line, borderRadius: 6, cursor: "pointer" }} />
          </div>
        )}
      </Group>

      {/* Responsive */}
      <Group label="Mobile size (px)">
        <input type="number" value={style.mobileFontSize ?? ""} onChange={(e) => patch({ mobileFontSize: e.target.value ? Number(e.target.value) : undefined })} placeholder="Same as desktop" style={inp} />
      </Group>

      <button onClick={clearSlot} style={{ marginTop: 2, padding: "7px 10px", borderRadius: 7, border: "1px solid " + C.line, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>
        Reset this element
      </button>
    </div>
  );

  // ── Effects controls (Interactions tab / floating Effects tab) — admin only ─
  const effectsControls = (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Visual</div>

      <Group label="Glow">
        <Toggle on={!!style.glow} onToggle={(v) => patch({ glow: v ? { color: "#c79a4b", size: 12 } : null })} />
        {style.glow && (
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "flex-end" }}>
            <input type="color" value={hexOf(style.glow.color)} onChange={(e) => patch({ glow: { ...style.glow!, color: e.target.value } })} style={swatch} />
            <SmallNum label="Size" value={style.glow.size} onChange={(size) => patch({ glow: { ...style.glow!, size } })} />
          </div>
        )}
      </Group>

      <Group label="Outline / stroke">
        <Toggle on={!!style.stroke} onToggle={(v) => patch({ stroke: v ? { width: 1, color: "#000000" } : null })} />
        {style.stroke && (
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "flex-end" }}>
            <input type="color" value={hexOf(style.stroke.color)} onChange={(e) => patch({ stroke: { ...style.stroke!, color: e.target.value } })} style={swatch} />
            <SmallNum label="Width" value={style.stroke.width} onChange={(width) => patch({ stroke: { ...style.stroke!, width } })} />
          </div>
        )}
      </Group>

      <Group label="Gradient fill">
        <Toggle on={!!style.gradient} onToggle={(v) => patch({ gradient: v ? { from: "#c79a4b", to: "#6bb39e", angle: 90 } : null })} />
        {style.gradient && (
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "flex-end" }}>
            <input type="color" value={hexOf(style.gradient.from)} onChange={(e) => patch({ gradient: { ...style.gradient!, from: e.target.value } })} style={swatch} />
            <input type="color" value={hexOf(style.gradient.to)} onChange={(e) => patch({ gradient: { ...style.gradient!, to: e.target.value } })} style={swatch} />
            <SmallNum label="Angle" value={style.gradient.angle} onChange={(angle) => patch({ gradient: { ...style.gradient!, angle } })} />
          </div>
        )}
      </Group>

      <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "1px solid " + C.line, paddingTop: 12 }}>Animations</div>
      <PresetRow label="On hover" value={style.hover} opts={[["lift", "Lift"], ["grow", "Grow"], ["glow", "Glow"]]} onPick={(v) => patch({ hover: (v as HoverFx) ?? undefined })} />
      <PresetRow label="On press" value={style.press} opts={[["shrink", "Shrink"], ["push", "Push"]]} onPick={(v) => patch({ press: (v as PressFx) ?? undefined })} />
      <PresetRow label="Loop" value={style.loop} opts={[["float", "Float"], ["pulse", "Pulse"], ["shimmer", "Shimmer"]]} onPick={(v) => patch({ loop: (v as LoopFx) ?? undefined })} />
      <PresetRow label="On scroll in" value={style.scroll} opts={[["fadeup", "Fade up"], ["slidein", "Slide in"], ["zoomin", "Zoom in"]]} onPick={(v) => patch({ scroll: (v as ScrollFx) ?? undefined })} />
      <PresetRow label="On appear (page load)" value={style.appear} opts={[["fade", "Fade"], ["rise", "Rise"], ["zoom", "Zoom"], ["blur", "Blur"], ["flip", "Flip"], ["bounce", "Bounce"]]} onPick={(v) => patch({ appear: (v as AppearFx) ?? undefined })} />
      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.4 }}>Scroll animations play on the published site.</div>
    </div>
  );

  const note = (text: string) => (
    <div style={{ padding: "22px 18px", color: C.muted, fontSize: 12, lineHeight: 1.55, textAlign: "center" }}>{text}</div>
  );

  // ── Docked: portal the controls into the inspector's Design / Interactions
  // tabs whenever the right panel is open. Always fills the slot with a precise
  // state (needs sign-in / tap text / the live controls). ────────────────────
  if (slots.design || slots.fx) {
    // Design (typography) is available on every plan — gated only by the theme
    // permission (which decides whether this component is `active` at all).
    const designContent = activeKey
      ? <>{dockHeader}{styleControls}</>
      : note("Tap any heading or paragraph on your site — its font, size, colour, alignment and shadow controls open right here.");
    const fxContent = !isAdmin
      ? note("Animations & effects are managed by your Retiar team.")
      : activeKey
        ? <>{dockHeader}{effectsControls}</>
        : note("Tap any text on your site, then add hover, scroll and page-load animations here.");
    return (
      <>
        {slots.design && createPortal(designContent, slots.design)}
        {slots.fx && createPortal(fxContent, slots.fx)}
      </>
    );
  }

  // ── Floating fallback: inspector closed, so show the movable panel. ─────────
  if (!activeKey) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: 96,
        right: 12,
        zIndex: 90,
        width: size.w,
        height: size.h ?? undefined,
        maxHeight: size.h ? undefined : "calc(100vh - 120px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: C.bar,
        border: "1px solid " + C.line,
        borderRadius: 12,
        boxShadow: "0 16px 40px rgba(0,0,0,.5)",
        color: C.text,
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        fontSize: 12.5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 12px", borderBottom: "1px solid " + C.lineSoft, position: "sticky", top: 0, background: C.bar, zIndex: 1 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Text style</div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>{fieldLabel(activeKey)}</div>
        </div>
        <button onClick={() => setActiveKey(null)} title="Close" style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      <div className="rtr-scroll" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
      {isAdmin && (
        <div style={{ display: "flex", gap: 4, padding: "10px 12px 0" }}>
          <button onClick={() => setTab("style")} style={tabBtn(tab === "style")}>Style</button>
          <button onClick={() => setTab("effects")} style={tabBtn(tab === "effects")}>Effects</button>
        </div>
      )}

      {(tab === "style" || !isAdmin) && styleControls}

      {tab === "effects" && isAdmin && effectsControls}
      </div>

      {/* Drag grip — resize the whole panel (touch-friendly) */}
      <div
        onPointerDown={onHandleDown}
        onPointerMove={onHandleMove}
        onPointerUp={onHandleUp}
        title="Drag to resize"
        style={{ position: "absolute", left: 0, bottom: 0, width: 24, height: 24, cursor: "nesw-resize", touchAction: "none", display: "flex", alignItems: "flex-end", justifyContent: "flex-start", padding: 4 }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden style={{ opacity: 0.6 }}>
          <g stroke={C.muted} strokeWidth="1.3" strokeLinecap="round">
            <path d="M1 11 L11 1" /><path d="M1 7.5 L7.5 1" /><path d="M1 4 L4 1" />
          </g>
        </svg>
      </div>
    </div>
  );
}

const inp = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid " + C.line,
  background: C.lineSoft,
  color: C.text,
  fontSize: 12.5,
  fontFamily: "inherit",
} as const;
const chip = { padding: "3px 7px", borderRadius: 999, border: "1px solid " + C.line, background: "transparent", color: C.text, fontSize: 11, cursor: "pointer" } as const;
const chipActive = { background: C.gold, color: C.bar, borderColor: C.gold } as const;
const alignBtn = { flex: 1, height: 30, borderRadius: 6, border: "1px solid " + C.line, background: "transparent", color: C.text, cursor: "pointer", fontSize: 14 } as const;
const stepBtn = { width: 28, height: 30, flex: "none", borderRadius: 6, border: "1px solid " + C.line, background: "transparent", color: C.text, fontSize: 16, cursor: "pointer", fontFamily: "inherit" } as const;
const swatch = { width: 34, height: 30, padding: 0, border: "1px solid " + C.line, borderRadius: 6, cursor: "pointer", background: "transparent", flex: "none" } as const;
const presetBtn = { padding: "5px 9px", borderRadius: 999, border: "1px solid " + C.line, background: "transparent", color: C.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } as const;
function tabBtn(on: boolean): React.CSSProperties {
  return { flex: 1, padding: "6px 10px", borderRadius: 7, border: "1px solid " + (on ? C.gold : C.line), background: on ? C.gold : "transparent", color: on ? C.bar : C.text, fontWeight: on ? 700 : 500, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" };
}
function Toggle({ on, onToggle }: { on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <input type="checkbox" checked={on} onChange={(e) => onToggle(e.target.checked)} />
      <span style={{ color: C.muted }}>{on ? "On" : "Off"}</span>
    </label>
  );
}
function PresetRow({ label, value, opts, onPick }: { label: string; value?: string | null; opts: [string, string][]; onPick: (v: string | undefined) => void }) {
  return (
    <div>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 5, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {opts.map(([val, lbl]) => {
          const on = value === val;
          return (
            <button key={val} onClick={() => onPick(on ? undefined : val)} style={{ ...presetBtn, ...(on ? chipActive : {}) }}>{lbl}</button>
          );
        })}
      </div>
    </div>
  );
}
function fontRowStyle(on: boolean, ff: string): React.CSSProperties {
  return { display: "block", width: "100%", textAlign: "left", padding: "9px 11px", border: "none", borderBottom: "1px solid " + C.line, cursor: "pointer", background: on ? C.gold : "transparent", color: on ? C.bar : C.text, fontSize: 15, fontWeight: on ? 700 : 500, fontFamily: ff };
}

function Group({ label, children, flex }: { label: string; children: React.ReactNode; flex?: boolean }) {
  return (
    <div style={{ flex: flex ? 1 : undefined, minWidth: 0 }}>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 5, fontWeight: 600, letterSpacing: "0.02em" }}>{label}</div>
      {children}
    </div>
  );
}
function SmallNum({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ color: C.muted, fontSize: 10, marginBottom: 3 }}>{label}</div>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} style={inp} />
    </div>
  );
}
function hexOf(color: string): string {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#000000";
}

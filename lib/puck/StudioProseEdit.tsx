"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePuck, type Data } from "@puckeditor/core";
import { callAi, canvasSelection, probeAiEnabled } from "@/lib/puck/ai";
import type { ElementStyles, SlotStyle } from "@/lib/puck/elementStyles";

// On-canvas text toolbar. When any editable text slot is tapped/focused/selected
// in the canvas, we draw a SOLID selection box around it (with corner handles)
// and float a dark toolbar above it — Bold / Italic / Link / ✨ AI — matching the
// reference design. Bold & Italic apply via the design layer (root.props
// .elementStyles) so they render on the element in BOTH the editor and the
// published site; Link inserts markdown in prose fields; AI rewrites the words.

type Box = { left: number; top: number; width: number; height: number } | null;
type DesignRootProps = { elementStyles?: ElementStyles; fonts?: string[]; [k: string]: unknown };

const BLUE = "#4c8bf5";
const C = { bar: "#14211c", line: "#25382e", text: "#ece5d8", muted: "#9aa79b", gold: "#c79a4b" };

const AI_ACTIONS = [
  { key: "improve", label: "✨ Improve writing" },
  { key: "shorten", label: "✂️ Make shorter" },
  { key: "expand", label: "➕ Make longer" },
  { key: "professional", label: "👔 More professional" },
  { key: "friendly", label: "😊 Friendlier tone" },
  { key: "fix", label: "✓ Fix spelling & grammar" },
];

export default function StudioProseEdit({ active }: { active: boolean }) {
  const { appState, dispatch } = usePuck();
  const [box, setBox] = useState<Box>(null);
  const [fieldKey, setFieldKey] = useState<string | null>(null);
  const [isProse, setIsProse] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [headerOpen, setHeaderOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const docRef = useRef<Document | null>(null);
  const elRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let a = true;
    probeAiEnabled().then((v) => a && setAiEnabled(v));
    return () => {
      a = false;
    };
  }, []);

  useEffect(() => {
    if (!active) {
      setBox(null);
      setFieldKey(null);
      return;
    }
    let stop = false;
    let boundDoc: Document | null = null;
    const iframe = () => document.querySelector<HTMLIFrameElement>('[class*="PuckCanvas"] iframe, iframe');

    function reposition() {
      const el = elRef.current;
      const ifr = iframe();
      if (!el || !ifr || !el.isConnected) return;
      const r = el.getBoundingClientRect();
      const io = ifr.getBoundingClientRect();
      if (!r.width && !r.height) return;
      // The canvas may be zoomed (CSS scale) to fit — map the element's internal
      // rect to the parent's scaled visual coords.
      const innerW = ifr.contentDocument?.documentElement?.clientWidth || io.width;
      const k = innerW ? io.width / innerW : 1;
      setBox({ left: io.left + r.left * k, top: io.top + r.top * k, width: r.width * k, height: r.height * k });
    }
    function locate() {
      const doc = boundDoc;
      if (!doc) return;
      const sel = doc.getSelection();
      const node = (sel && sel.anchorNode) || (doc.activeElement as Node | null);
      const el = node && (node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement));
      const host = el?.closest?.('[data-rtr-field^="ov:"]') as HTMLElement | null;
      if (!host) return; // keep the current target if focus moved to our toolbar
      elRef.current = host;
      setFieldKey(host.getAttribute("data-rtr-field"));
      setIsProse(!!host.closest("[data-rtr-rich]"));
      setAiOpen(false);
      setNote(null);
      reposition();
    }
    // Dismiss the toolbar. Called when the user clicks away from any editable
    // text slot (inside the canvas, or on the surrounding editor chrome).
    function clearSel() {
      elRef.current = null;
      setBox(null);
      setFieldKey(null);
      setAiOpen(false);
      setHeaderOpen(false);
      setNote(null);
    }
    // A click INSIDE the canvas that isn't on an editable slot → deselect.
    function onCanvasClick(e: Event) {
      const t = e.target as HTMLElement | null;
      if (!t?.closest?.('[data-rtr-field^="ov:"]')) clearSel();
    }
    // A click on the surrounding chrome (rails, top bar, canvas padding) that
    // isn't on our own toolbar → deselect. Clicks inside the iframe never reach
    // the parent document, so this only fires for outside-the-canvas clicks.
    function onParentDown(e: Event) {
      const t = e.target as Node | null;
      if (barRef.current && t && barRef.current.contains(t)) return;
      clearSel();
    }
    function arm() {
      if (stop) return;
      const doc = iframe()?.contentDocument ?? null;
      if (!doc || doc === boundDoc) return;
      boundDoc = doc;
      docRef.current = doc;
      doc.addEventListener("selectionchange", locate);
      doc.addEventListener("focusin", locate, true);
      doc.addEventListener("click", locate, true);
      doc.addEventListener("click", onCanvasClick, true);
      doc.addEventListener("scroll", reposition, true);
    }
    arm();
    const id = window.setInterval(() => {
      arm();
      reposition();
    }, 300);
    window.addEventListener("resize", reposition);
    document.addEventListener("mousedown", onParentDown, true);
    return () => {
      stop = true;
      window.clearInterval(id);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("mousedown", onParentDown, true);
      if (boundDoc) {
        boundDoc.removeEventListener("selectionchange", locate);
        boundDoc.removeEventListener("focusin", locate, true);
        boundDoc.removeEventListener("click", locate, true);
        boundDoc.removeEventListener("click", onCanvasClick, true);
        boundDoc.removeEventListener("scroll", reposition, true);
      }
    };
  }, [active]);

  const rootProps = (appState.data.root?.props ?? {}) as DesignRootProps;
  const style: SlotStyle = (fieldKey && rootProps.elementStyles?.[fieldKey]) || {};
  const isBold = (style.fontWeight ?? 0) >= 600;
  const isItalic = style.fontStyle === "italic";
  const deco = style.textDecoration || "";
  const isUnderline = deco.includes("underline");
  const isStrike = deco.includes("line-through");

  const patchStyle = useCallback(
    (p: Partial<SlotStyle>) => {
      if (!fieldKey) return;
      dispatch({
        type: "setData",
        recordHistory: true, // so the ↶ undo button reverts bold/italic (design layer)
        data: ((prev: Data) => {
          const rp = (prev.root?.props ?? {}) as DesignRootProps;
          const next: Record<string, unknown> = { ...(rp.elementStyles?.[fieldKey] || {}), ...p };
          Object.keys(next).forEach((k) => next[k] === undefined && delete next[k]);
          const elementStyles = { ...(rp.elementStyles || {}), [fieldKey]: next };
          return { ...prev, root: { ...prev.root, props: { ...rp, elementStyles } } };
        }) as unknown as Partial<Data>,
      });
    },
    [fieldKey, dispatch],
  );

  // Underline / strikethrough via the design layer (renders + publishes on the
  // whole element, like bold/italic).
  function toggleDecoration(which: "underline" | "line-through") {
    const set = new Set(deco.split(" ").filter(Boolean));
    if (set.has(which)) set.delete(which);
    else set.add(which);
    const val = [...set].join(" ");
    patchStyle({ textDecoration: (val || undefined) as SlotStyle["textDecoration"] });
  }

  // Link: wrap the selection in markdown (only meaningful in prose fields).
  function addLink() {
    const doc = docRef.current;
    const sel = doc?.getSelection();
    if (!doc || !sel || sel.isCollapsed || sel.rangeCount === 0) {
      setNote("Select the words you want to link first.");
      return;
    }
    const url = window.prompt("Link URL (https://…):", "https://");
    if (!url) return;
    const text = sel.toString();
    const range = sel.getRangeAt(0);
    const host = (sel.anchorNode?.nodeType === Node.TEXT_NODE ? sel.anchorNode.parentElement : (sel.anchorNode as HTMLElement))?.closest?.("[data-rtr-rich], [contenteditable]");
    const editable = host?.querySelector<HTMLElement>("[contenteditable]") ?? (host as HTMLElement | null);
    range.deleteContents();
    const node = doc.createTextNode(`[${text}](${url})`);
    range.insertNode(node);
    editable?.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }

  const runAI = useCallback(async (action: string) => {
    const selection = canvasSelection();
    setAiOpen(false);
    setAiBusy(true);
    setNote(null);
    const text = selection?.text || elRef.current?.textContent || "";
    const res = await callAi({ action, text });
    setAiBusy(false);
    if (res.error || !res.text) {
      setNote(res.error || "AI couldn’t process that.");
      return;
    }
    if (selection) selection.replace(res.text);
    else setNote("Select the text to replace, then try again.");
  }, []);

  if (!active || !box || !fieldKey) return null;

  const handle = { position: "absolute" as const, width: 9, height: 9, borderRadius: 99, background: "#fff", border: `2px solid ${BLUE}`, boxSizing: "border-box" as const };
  const tbtn = (label: ReactNode, on: boolean, onDown: () => void, extra?: CSSProperties) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onDown();
      }}
      style={{ minWidth: 30, height: 30, padding: "0 9px", border: "none", borderRadius: 7, background: on ? "#26374a" : "transparent", color: C.text, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", ...extra }}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Solid selection box + corner handles */}
      <div style={{ position: "fixed", left: box.left, top: box.top, width: box.width, height: box.height, border: `2px solid ${BLUE}`, borderRadius: 6, pointerEvents: "none", zIndex: 68, boxSizing: "border-box" }}>
        <span style={{ ...handle, left: -5, top: -5 }} />
        <span style={{ ...handle, right: -5, top: -5 }} />
        <span style={{ ...handle, left: -5, bottom: -5 }} />
        <span style={{ ...handle, right: -5, bottom: -5 }} />
      </div>

      {/* Toolbar above the selection */}
      <div ref={barRef} style={{ position: "fixed", left: box.left + box.width / 2, top: box.top - 50, transform: "translateX(-50%)", zIndex: 76, fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: 4, borderRadius: 10, background: C.bar, border: "1px solid " + C.line, boxShadow: "0 10px 26px rgba(0,0,0,0.55)" }}>
          {tbtn("B", isBold, () => patchStyle({ fontWeight: isBold ? undefined : 700 }), { fontWeight: 800 })}
          {tbtn("I", isItalic, () => patchStyle({ fontStyle: isItalic ? undefined : "italic" }), { fontStyle: "italic", fontWeight: 600 })}
          {tbtn("U", isUnderline, () => toggleDecoration("underline"), { textDecoration: "underline" })}
          {tbtn("S", isStrike, () => toggleDecoration("line-through"), { textDecoration: "line-through" })}
          {tbtn("H ▾", headerOpen, () => { setHeaderOpen((o) => !o); setAiOpen(false); }, { fontSize: 12, fontWeight: 700 })}
          {tbtn("🔗 Link", false, addLink, { fontSize: 12, fontWeight: 600 })}
          {aiEnabled && (
            <>
              <span style={{ width: 1, height: 18, background: C.line, margin: "0 2px" }} />
              {tbtn(aiBusy ? "✨…" : "✨ AI", aiOpen, () => !aiBusy && setAiOpen((o) => !o), { fontSize: 12, fontWeight: 700, color: C.gold })}
            </>
          )}
        </div>

        {headerOpen && (
          <div style={{ marginTop: 6, padding: 4, borderRadius: 10, background: C.bar, border: "1px solid " + C.line, boxShadow: "0 10px 26px rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", minWidth: 150 }}>
            {([["Heading 1", 44], ["Heading 2", 32], ["Heading 3", 24], ["Normal text", undefined]] as [string, number | undefined][]).map(([lbl, size]) => (
              <button key={lbl} onMouseDown={(e) => { e.preventDefault(); patchStyle({ fontSize: size, fontWeight: size ? 700 : undefined }); setHeaderOpen(false); }} style={{ textAlign: "left", padding: "7px 10px", border: "none", borderRadius: 6, background: "transparent", color: C.text, fontSize: size ? Math.min(18, 12 + (size - 24) / 4) : 13, fontWeight: size ? 700 : 500, cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#20342a")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                {lbl}
              </button>
            ))}
          </div>
        )}

        {aiOpen && !aiBusy && (
          <div style={{ marginTop: 6, padding: 4, borderRadius: 10, background: C.bar, border: "1px solid " + C.line, boxShadow: "0 10px 26px rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", minWidth: 190 }}>
            {AI_ACTIONS.map((a) => (
              <button key={a.key} onMouseDown={(e) => { e.preventDefault(); runAI(a.key); }} style={{ textAlign: "left", padding: "7px 10px", border: "none", borderRadius: 6, background: "transparent", color: C.text, fontSize: 13, cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#20342a")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                {a.label}
              </button>
            ))}
          </div>
        )}

        {note && (
          <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 9, background: C.bar, border: "1px solid #4a3a1e", color: "#e6cf8f", fontSize: 12, maxWidth: 240, boxShadow: "0 10px 26px rgba(0,0,0,0.5)" }}>{note}</div>
        )}
      </div>
    </>
  );
}

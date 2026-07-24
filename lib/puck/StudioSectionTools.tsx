"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePuck } from "@puckeditor/core";

// On-canvas section controls. When a section (a top-level Puck component) is
// selected in the canvas, a small toolbar pins to its top-right corner with
// Move up / Move down / Duplicate / Delete — so sections are reordered right on
// the page (touch-friendly, no dragging). Gated by caps: reorder needs the
// "layout" cap, add/remove needs the "sections" cap (admins get both).

const ROOT_ZONE = "root:default-zone";
const C = { bar: "#14211c", line: "#25382e", text: "#ece5d8", muted: "#9aa79b", danger: "#c8674a" };

type Box = { left: number; top: number; width: number } | null;

export default function StudioSectionTools({
  active,
  canReorder,
  canAddRemove,
}: {
  active: boolean;
  canReorder: boolean;
  canAddRemove: boolean;
}) {
  const { appState, dispatch } = usePuck();
  const sel = appState.ui.itemSelector;
  const [box, setBox] = useState<Box>(null);

  useEffect(() => {
    if (!active || !sel) {
      setBox(null);
      return;
    }
    const iframe = () =>
      document.querySelector<HTMLIFrameElement>('[class*="PuckCanvas"] iframe, iframe');
    function reposition() {
      const ifr = iframe();
      const doc = ifr?.contentDocument;
      if (!ifr || !doc) return;
      const el = doc.querySelector<HTMLElement>('[class*="DraggableComponent--isSelected"]');
      if (!el) {
        setBox(null);
        return;
      }
      const r = el.getBoundingClientRect();
      const io = ifr.getBoundingClientRect();
      if (!r.width && !r.height) return;
      // The canvas may be CSS-scaled to fit — map internal rect → visual coords.
      const innerW = doc.documentElement?.clientWidth || io.width;
      const k = innerW ? io.width / innerW : 1;
      setBox({ left: io.left + r.left * k, top: io.top + r.top * k, width: r.width * k });
    }
    reposition();
    const id = window.setInterval(reposition, 300);
    window.addEventListener("resize", reposition);
    const doc = iframe()?.contentDocument;
    doc?.addEventListener("scroll", reposition, true);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", reposition);
      doc?.removeEventListener("scroll", reposition, true);
    };
  }, [active, sel?.index, sel?.zone]);

  if (!active || !sel || !box || (!canReorder && !canAddRemove)) return null;

  const zone = sel.zone ?? ROOT_ZONE;
  const list = sel.zone ? appState.data.zones?.[sel.zone] ?? [] : appState.data.content;
  const index = sel.index;
  const count = list.length;
  const canUp = canReorder && index > 0;
  const canDown = canReorder && index < count - 1;

  function move(to: number) {
    if (to < 0 || to >= count) return;
    // Deterministic adjacent swap via setData — reliable in both directions
    // (Puck's reorder convention is off-by-one when moving down).
    dispatch({
      type: "setData",
      recordHistory: true,
      data: (prev) => {
        const z = sel!.zone;
        if (z) {
          const arr = [...(prev.zones?.[z] ?? [])];
          [arr[index], arr[to]] = [arr[to], arr[index]];
          return { ...prev, zones: { ...(prev.zones ?? {}), [z]: arr } };
        }
        const arr = [...prev.content];
        [arr[index], arr[to]] = [arr[to], arr[index]];
        return { ...prev, content: arr };
      },
    });
    dispatch({ type: "setUi", ui: { itemSelector: { index: to, zone: sel!.zone } } });
  }
  function dup() {
    dispatch({ type: "duplicate", sourceIndex: index, sourceZone: zone, recordHistory: true });
  }
  function del() {
    if (!window.confirm("Delete this section? You can undo with ↶.")) return;
    dispatch({ type: "remove", index, zone, recordHistory: true });
    dispatch({ type: "setUi", ui: { itemSelector: null } });
  }

  const btn = (
    label: ReactNode,
    onDown: () => void,
    disabled = false,
    danger = false,
    title = "",
  ) => (
    <button
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onDown();
      }}
      style={{
        minWidth: 30,
        height: 30,
        padding: "0 8px",
        border: "none",
        borderRadius: 7,
        background: "transparent",
        color: disabled ? "#5b6b60" : danger ? C.danger : C.text,
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      } as CSSProperties}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: "fixed",
        left: box.left + box.width - 4,
        top: box.top + 6,
        transform: "translateX(-100%)",
        zIndex: 74,
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: 4, borderRadius: 10, background: C.bar, border: "1px solid " + C.line, boxShadow: "0 10px 26px rgba(0,0,0,0.55)" }}>
        {canReorder && btn("↑", () => move(index - 1), !canUp, false, "Move section up")}
        {canReorder && btn("↓", () => move(index + 1), !canDown, false, "Move section down")}
        {canAddRemove && btn("⧉", dup, false, false, "Duplicate section")}
        {canAddRemove && btn("🗑", del, false, true, "Delete section")}
      </div>
    </div>
  );
}

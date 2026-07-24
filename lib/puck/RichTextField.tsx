"use client";

import { useRef, useState } from "react";
import { renderRich } from "@/lib/richtext";

// Puck custom field for prose: a textarea with Bold / Italic / Link buttons that
// wrap the current selection in markdown, plus a live preview of the rendered
// result. Stores a plain markdown string (bold/italic/links); the site renders
// it safely via <RichText>.
export function RichTextField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(true);

  function wrap(marker: string, placeholder: string) {
    const ta = ref.current;
    if (!ta) return;
    const v = value ?? "";
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = v.slice(start, end) || placeholder;
    onChange(v.slice(0, start) + marker + sel + marker + v.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + marker.length, start + marker.length + sel.length);
    });
  }

  function addLink() {
    const ta = ref.current;
    if (!ta) return;
    const url = window.prompt("Link URL (https://…):", "https://");
    if (!url) return;
    const v = value ?? "";
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = v.slice(start, end) || "link text";
    onChange(v.slice(0, start) + `[${sel}](${url})` + v.slice(end));
  }

  const btn = {
    padding: "3px 9px",
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
  } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 4 }}>
        <button type="button" onClick={() => wrap("**", "bold")} style={{ ...btn, fontWeight: 800 }}>
          B
        </button>
        <button type="button" onClick={() => wrap("*", "italic")} style={{ ...btn, fontStyle: "italic" }}>
          I
        </button>
        <button type="button" onClick={addLink} style={btn}>
          Link
        </button>
        <button
          type="button"
          onClick={() => setShowPreview((p) => !p)}
          style={{ ...btn, marginLeft: "auto", fontWeight: 500 }}
        >
          {showPreview ? "Hide preview" : "Preview"}
        </button>
      </div>
      <textarea
        ref={ref}
        data-rtr-richfield=""
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        style={{
          padding: 8,
          border: "1px solid #cbd5e1",
          borderRadius: 6,
          fontSize: 13,
          fontFamily: "inherit",
          resize: "vertical",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
      {showPreview && (
        <div style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.5 }}>
          <span style={{ color: "#94a3b8" }}>Preview: </span>
          <span dangerouslySetInnerHTML={{ __html: renderRich(value ?? "") }} />
        </div>
      )}
      <span style={{ fontSize: 11, color: "#94a3b8" }}>
        **bold** · *italic* · use the Link button
      </span>
    </div>
  );
}

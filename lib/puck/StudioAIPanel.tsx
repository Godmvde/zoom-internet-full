"use client";

import { useRef, useState } from "react";
import { callAi, canvasSelection } from "@/lib/puck/ai";

// Docked AI assistant for the Studio. Suggestion chips + an "Ask anything" box.
// When text is selected in the canvas, the relevant chips act on that selection
// and offer to insert the rewrite in place; otherwise the AI generates fresh
// copy you can copy or insert. Reuses Retiar's plan-gated /api/ai endpoint.

type Msg = { role: "user" | "ai"; text: string; error?: boolean; insert?: () => void };

const C = {
  bar: "#14211c",
  panel: "#101a15",
  line: "#25382e",
  lineSoft: "#1a2a23",
  text: "#ece5d8",
  muted: "#9aa79b",
  gold: "#c79a4b",
  green: "#6bb39e",
  userBubble: "#1f3128",
};

const CHIPS: { label: string; action?: string; instruction?: string; useSelection: boolean; needsLang?: boolean }[] = [
  { label: "✨ Improve selected", action: "improve", useSelection: true },
  { label: "✂️ Shorten selected", action: "shorten", useSelection: true },
  { label: "👔 More professional", action: "professional", useSelection: true },
  { label: "🌐 Translate…", useSelection: true, needsLang: true },
  { label: "✍️ Write a headline", action: "headline", useSelection: false },
  { label: "📝 Write a blurb", action: "blurb", useSelection: false },
];

export default function StudioAIPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  function push(m: Msg) {
    setMessages((prev) => [...prev, m]);
    requestAnimationFrame(() => {
      if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
    });
  }

  async function run(opts: { label: string; action?: string; instruction?: string; useSelection: boolean }) {
    if (busy) return;
    const selection = opts.useSelection ? canvasSelection() : null;
    push({ role: "user", text: opts.label + (selection ? "  ·  on selected text" : "") });
    setBusy(true);
    const res = await callAi({
      action: opts.action,
      instruction: opts.instruction,
      text: selection?.text,
    });
    setBusy(false);
    if (res.error || !res.text) {
      push({ role: "ai", text: res.error || "No response. Try again.", error: true });
      return;
    }
    push({
      role: "ai",
      text: res.text,
      insert: selection ? () => selection.replace(res.text!) : undefined,
    });
  }

  function onChip(c: (typeof CHIPS)[number]) {
    if (c.needsLang) {
      const lang = window.prompt("Translate the selected text to which language?", "Spanish");
      if (!lang) return;
      run({ label: `Translate to ${lang}`, instruction: `Translate this text to ${lang}. Keep the tone.`, useSelection: true });
      return;
    }
    run({ label: c.label, action: c.action, useSelection: c.useSelection });
  }

  function onSend() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    run({ label: q, instruction: q, useSelection: true });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, fontSize: 13 }}>
      {/* Thread */}
      <div ref={threadRef} className="rtr-scroll" style={{ flex: 1, overflow: "auto", minHeight: 0, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ color: C.muted, lineHeight: 1.5, padding: "8px 2px" }}>
            <div style={{ color: C.text, fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="16" height="16" viewBox="0 0 32 32" style={{ color: C.gold, flex: "none" }} aria-hidden>
                <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M16 2 L30 16 L16 30 L2 16 Z" opacity="0.55" />
                  <path d="M16 2 L16 30 M2 16 L30 16 M6 6 L26 26 M26 6 L6 26" />
                </g>
                <g fill="currentColor">
                  <circle cx="16" cy="2" r="1.8" />
                  <circle cx="30" cy="16" r="1.8" />
                  <circle cx="16" cy="30" r="1.8" />
                  <circle cx="2" cy="16" r="1.8" />
                  <circle cx="16" cy="16" r="2" />
                </g>
              </svg>
              Retiar AI
            </div>
            Select text on the page, then tap a suggestion to rewrite it — or ask for anything below.
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} style={{ alignSelf: "flex-end", maxWidth: "90%", background: C.userBubble, color: C.text, padding: "7px 10px", borderRadius: "10px 10px 2px 10px", lineHeight: 1.45 }}>
              {m.text}
            </div>
          ) : (
            <div key={i} style={{ alignSelf: "flex-start", maxWidth: "95%", background: m.error ? "rgba(200,103,74,.12)" : C.lineSoft, color: m.error ? "#e6b09f" : C.text, padding: "9px 11px", borderRadius: "10px 10px 10px 2px", lineHeight: 1.5, border: "1px solid " + (m.error ? "rgba(200,103,74,.3)" : C.line) }}>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              {!m.error && (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {m.insert && (
                    <button onClick={m.insert} style={btnStyle(true)}>Insert</button>
                  )}
                  <button onClick={() => navigator.clipboard?.writeText(m.text)} style={btnStyle(false)}>Copy</button>
                </div>
              )}
            </div>
          ),
        )}
        {busy && <div style={{ alignSelf: "flex-start", color: C.muted, padding: "4px 2px" }}>✨ Thinking…</div>}
      </div>

      {/* Chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 12px", borderTop: "1px solid " + C.lineSoft }}>
        {CHIPS.map((c) => (
          <button key={c.label} onClick={() => onChip(c)} disabled={busy} style={chipStyle(busy)}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Ask box */}
      <div style={{ display: "flex", gap: 6, padding: 12, borderTop: "1px solid " + C.line }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Ask AI to write or change anything…"
          style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid " + C.line, background: C.lineSoft, color: C.text, fontSize: 13, fontFamily: "inherit" }}
        />
        <button onClick={onSend} disabled={busy || !input.trim()} style={{ ...btnStyle(true), padding: "0 14px", opacity: busy || !input.trim() ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  );
}

function chipStyle(busy: boolean) {
  return {
    padding: "5px 9px",
    borderRadius: 999,
    border: "1px solid " + C.line,
    background: "transparent",
    color: C.text,
    fontSize: 12,
    cursor: busy ? "not-allowed" : "pointer",
    opacity: busy ? 0.6 : 1,
    fontFamily: "inherit",
  } as const;
}
function btnStyle(primary: boolean) {
  return {
    height: 28,
    padding: "0 10px",
    borderRadius: 7,
    border: "1px solid " + (primary ? C.green : C.line),
    background: primary ? C.green : "transparent",
    color: primary ? C.bar : C.text,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  } as const;
}

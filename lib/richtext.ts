// Minimal, XSS-safe markdown → HTML for rich text (bold / italic / links only).
//
// Safe BY CONSTRUCTION: every input character is HTML-escaped first, so no raw
// tag the user types can survive. Only AFTER escaping do we introduce our own
// whitelist of tags (<strong>, <em>, <a>, <br>). Link URLs are protocol-checked,
// so `javascript:`/`data:` are rejected. The output is safe to pass to
// dangerouslySetInnerHTML. Plain text (no markdown) renders identically to the
// raw string, so wrapping a field in rich text never changes existing content.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeUrl(url: string): string {
  const u = url.trim();
  // Allow http(s), mailto, tel, and relative/anchor links. Anything else (e.g.
  // javascript:, data:) collapses to a harmless "#".
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(u) ? u : "#";
}

export function renderRich(md: string): string {
  let s = escapeHtml(md ?? "");
  // [text](url) — text is already escaped; url is protocol-validated.
  s = s.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, text: string, url: string) =>
      `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`,
  );
  // **bold** (before italic so ** isn't eaten by the single-* rule)
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // *italic* (a single * not adjacent to another *)
  s = s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  // line breaks
  s = s.replace(/\n/g, "<br/>");
  return s;
}

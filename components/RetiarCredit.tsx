// The Retiar footer credit — every site Retiar builds carries one quiet,
// followable link home. Kept self-contained (no imports) so the same file drops
// into any client repo unchanged; the canonical copy lives in the platform repo
// at components/RetiarCredit.tsx + lib/credit.ts.
//
// Colour comes from `currentColor`, so it inherits whatever footer it sits in.
const CREDIT_HREF = "https://retiar.com/";
const CREDIT_LABEL = "Website by Retiar";

/**
 * Default ON: the credit shows unless a site's `design.credit` is explicitly
 * false. A site with no design blob, or one whose DB read failed, still credits
 * Retiar — the safe direction to fail in.
 */
export function showsCredit(design: unknown): boolean {
  if (!design || typeof design !== "object") return true;
  return (design as { credit?: unknown }).credit !== false;
}

export default function RetiarCredit({
  show = true,
  className = "",
}: {
  show?: boolean;
  className?: string;
}) {
  if (!show) return null;
  return (
    <a
      href={CREDIT_HREF}
      // A designer credit is a normal editorial link, so it stays followable —
      // that is the point of it. No nofollow, no target.
      rel="noopener"
      className={`inline-flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100 ${className}`}
    >
      <svg viewBox="0 0 32 32" className="w-3.5 h-3.5" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M16 2 L30 16 L16 30 L2 16 Z" opacity="0.55" />
          <path d="M16 2 L16 30 M2 16 L30 16 M6 6 L26 26 M26 6 L6 26" />
        </g>
        <g fill="currentColor">
          <circle cx="16" cy="2" r="1.6" />
          <circle cx="30" cy="16" r="1.6" />
          <circle cx="16" cy="30" r="1.6" />
          <circle cx="2" cy="16" r="1.6" />
          <circle cx="16" cy="16" r="1.8" />
        </g>
      </svg>
      <span>{CREDIT_LABEL}</span>
    </a>
  );
}

export default function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  const text = light ? "#ffffff" : "var(--color-navy)";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden>
        <defs>
          <linearGradient id="zlg" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0" stopColor="#19c2ff" />
            <stop offset="0.55" stopColor="#0a6cff" />
            <stop offset="1" stopColor="#0046b8" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#zlg)" />
        {/* signal waves */}
        <path d="M11 24.5a9 9 0 0 1 18 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
        <path d="M14.5 24.5a5.5 5.5 0 0 1 11 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
        <circle cx="20" cy="25" r="2.4" fill="#fff" />
      </svg>
      <span
        className="text-[1.35rem] font-bold tracking-tight"
        style={{ fontFamily: "var(--font-display)", color: text }}
      >
        Zoom<span style={{ color: "var(--color-zoom)" }}>.</span>
      </span>
    </span>
  );
}

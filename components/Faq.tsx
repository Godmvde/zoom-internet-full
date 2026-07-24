"use client";

import { useState } from "react";
import { faqs } from "@/lib/content";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="max-w-3xl mx-auto divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              aria-expanded={isOpen}
            >
              <span className={`font-semibold transition-colors ${isOpen ? "text-[var(--color-zoom)]" : "text-[var(--color-heading)] group-hover:text-[var(--color-zoom)]"}`}>
                {f.q}
              </span>
              <span
                className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                  isOpen ? "bg-[var(--color-zoom)] border-[var(--color-zoom)] text-white rotate-45" : "border-[var(--color-line)] text-[var(--color-slate)]"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="text-[var(--color-slate)] leading-relaxed pr-10">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

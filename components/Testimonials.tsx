"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { testimonials } from "@/lib/content";
import { makeT, type Overrides } from "@/lib/t";

const N = testimonials.length;

type Tr = (key: string, fallback: string) => string;

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-[#f5a623]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="w-4 h-4" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
        </svg>
      ))}
    </div>
  );
}

function CardInner({ t, idx, tr }: { t: (typeof testimonials)[number]; idx: number; tr: Tr }) {
  const name = tr(`testimonial.${idx}.name`, t.name);
  return (
    <>
      <Stars n={t.rating} />
      <blockquote className="text-[var(--color-heading)] text-lg mt-4 leading-relaxed flex-1" data-rtr-field={`ov:testimonial.${idx}.quote`}>
        &ldquo;{tr(`testimonial.${idx}.quote`, t.quote)}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-[var(--color-line)]">
        <span className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-zoom-bright)] to-[var(--color-zoom-deep)] text-white flex items-center justify-center font-semibold">
          {name.charAt(0)}
        </span>
        <span>
          <span className="block font-semibold text-[var(--color-heading)] text-sm" data-rtr-field={`ov:testimonial.${idx}.name`}>{name}</span>
          <span className="block text-xs text-[var(--color-muted)]" data-rtr-field={`ov:testimonial.${idx}.area`}>{tr(`testimonial.${idx}.area`, t.area)}</span>
        </span>
      </figcaption>
    </>
  );
}

// Stacked-deck transform for each card based on how far it is behind the front.
const DEPTH_STYLE = [
  { transform: "translateY(0px) scale(1) rotate(-1deg)", opacity: 1 },
  { transform: "translateY(20px) scale(0.95) rotate(2.6deg)", opacity: 1 },
  { transform: "translateY(40px) scale(0.9) rotate(-2.4deg)", opacity: 1 },
];

export default function Testimonials({ overrides }: { overrides?: Overrides }) {
  const tr = makeT(overrides);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const indexRef = useRef(0);

  const goTo = useCallback((next: number) => {
    if (next === indexRef.current) return;
    setLeaving(indexRef.current); // current front card flicks away
    indexRef.current = next;
    setIndex(next);
  }, []);

  const advance = useCallback(() => {
    goTo((indexRef.current + 1) % N);
  }, [goTo]);

  // Auto-shuffle every few seconds (paused on hover).
  useEffect(() => {
    if (paused) return;
    const id = setInterval(advance, 3800);
    return () => clearInterval(id);
  }, [paused, advance]);

  // Clear the leaving card once its flick animation finishes.
  useEffect(() => {
    if (leaving === null) return;
    const t = setTimeout(() => setLeaving(null), 640);
    return () => clearTimeout(t);
  }, [leaving]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative mx-auto w-full max-w-xl h-[320px] sm:h-[300px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Flicking-away card on top */}
        {leaving !== null && (
          <figure
            key={`leaving-${leaving}-${index}`}
            className="card card-flick absolute inset-x-0 top-0 p-7 sm:p-8 flex flex-col min-h-[280px]"
            style={{ zIndex: 50 }}
          >
            <CardInner t={testimonials[leaving]} idx={leaving} tr={tr} />
          </figure>
        )}

        {/* The stacked deck */}
        {testimonials.map((t, i) => {
          const depth = (i - index + N) % N;
          if (depth > 2) return null;
          if (leaving !== null && i === leaving) return null; // represented by the flick ghost
          const ds = DEPTH_STYLE[depth];
          return (
            <figure
              key={t.name}
              onClick={advance}
              className="card absolute inset-x-0 top-0 p-7 sm:p-8 flex flex-col min-h-[280px] cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ ...ds, zIndex: 40 - depth }}
            >
              <CardInner t={t} idx={i} tr={tr} />
            </figure>
          );
        })}
      </div>

      {/* Manual controls — prev / dots / next */}
      <div className="flex items-center gap-4 mt-6">
        <button
          aria-label="Previous review"
          onClick={() => goTo((indexRef.current - 1 + N) % N)}
          className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[var(--color-cyan)] text-[var(--color-heading)] flex items-center justify-center transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
        </button>

        <div className="flex items-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              aria-label={`Show review ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-[var(--color-zoom)]" : "w-2 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          aria-label="Next review"
          onClick={advance}
          className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[var(--color-cyan)] text-[var(--color-heading)] flex items-center justify-center transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}

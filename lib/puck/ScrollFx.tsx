"use client";

import { useEffect } from "react";

// Reveals scroll-animated slots: adds data-rtr-inview to each editable element
// when it scrolls into view (the elementStyles CSS animates the reveal). Emitted
// once from config.root.render, so it runs on the published site AND inside the
// editor canvas with no per-page wiring. Harmless for non-animated elements.
export default function ScrollFx() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-rtr-field^="ov:"]'));
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.setAttribute("data-rtr-inview", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.setAttribute("data-rtr-inview", "");
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return null;
}

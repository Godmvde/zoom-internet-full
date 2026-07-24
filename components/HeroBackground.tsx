"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroBackground() {
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parallax — track scroll with rAF throttling.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Drifting star particles on a canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0,
      h = 0,
      dpr = Math.min(window.devicePixelRatio || 1, 2);
    type Star = { x: number; y: number; r: number; vx: number; vy: number; tw: number; ph: number };
    let stars: Star[] = [];

    const seed = (n: number) => {
      // deterministic-ish spread without Math.random reliance issues
      return ((Math.sin(n * 999.13) + 1) / 2);
    };

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.floor((w * h) / 14000));
      stars = Array.from({ length: count }, (_, i) => ({
        x: seed(i + 1) * w,
        y: seed(i + 7.3) * h,
        r: 0.4 + seed(i + 3.1) * 1.5,
        vx: -(0.04 + seed(i + 5.5) * 0.12),
        vy: (seed(i + 9.2) - 0.5) * 0.06,
        tw: 0.6 + seed(i + 11.7) * 2.4,
        ph: seed(i + 13.9) * Math.PI * 2,
      }));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    let raf = 0;
    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -2) s.x = w + 2;
        if (s.y < -2) s.y = h + 2;
        if (s.y > h + 2) s.y = -2;
        const alpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    if (!prefersReduced) draw();
    else {
      // single static frame
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fill();
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const parY = scrollY * 0.28;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Parallax earth — portrait image on phones, landscape on desktop */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${parY}px, 0) scale(1.12)` }}
      >
        {/* sharp, punchy base */}
        <picture>
          <source media="(min-width: 1024px)" srcSet="/img/earth.png" />
          <img
            src="/img/hurt.png"
            alt="Planet Earth glowing with city lights, seen from space"
            className="earth-img w-full h-full object-cover"
          />
        </picture>
        {/* pulsing city-light glow (screen-blended warm copy) */}
        <picture>
          <source media="(min-width: 1024px)" srcSet="/img/earth.png" />
          <img
            src="/img/hurt.png"
            alt=""
            aria-hidden
            className="earth-pulse absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        </picture>
        {/* blurred copy — only the far edges show through the mask */}
        <picture>
          <source media="(min-width: 1024px)" srcSet="/img/earth.png" />
          <img
            src="/img/hurt.png"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "blur(7px)",
              WebkitMaskImage:
                "radial-gradient(ellipse 78% 82% at 50% 46%, transparent 52%, #000 90%)",
              maskImage:
                "radial-gradient(ellipse 78% 82% at 50% 46%, transparent 52%, #000 90%)",
            }}
          />
        </picture>
      </div>

      {/* Atmospheric horizon glow */}
      <div className="absolute -inset-10 hero-glow pointer-events-none" />

      {/* Star particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Cinematic vignette — bright focused Earth, near-black edges */}
      <div className="absolute inset-0 hero-vignette pointer-events-none" />

      {/* Left scrim for headline legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-navy)]/80 via-[var(--color-navy)]/25 to-transparent pointer-events-none" />
    </div>
  );
}

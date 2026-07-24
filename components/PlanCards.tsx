"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { plans as staticPlans, type Plan } from "@/lib/content";
import {
  CATALOG_SLUG,
  SUPABASE_URL,
  SUPABASE_ANON,
  mapPlans,
  type DbProduct,
} from "@/lib/catalog-map";
import { Check, Arrow } from "./Icons";
import Reveal from "./Reveal";

function formatPrice(n: number) {
  return n.toLocaleString("en-JM");
}

export default function PlanCards({ compact = false }: { compact?: boolean }) {
  // Start from the built-in plans, then upgrade to whatever the client manages
  // in the Retiar Products tab. Runs on every render path.
  const [plans, setPlans] = useState<Plan[]>(staticPlans);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
        const { data } = await sb.rpc("products_public", { p_slug: CATALOG_SLUG });
        const rows = (data as DbProduct[]) ?? [];
        if (alive && rows.length) setPlans(mapPlans(rows));
      } catch {
        /* keep the default plans */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-3 items-stretch">
      {plans.map((p, i) => (
        <Reveal key={p.id} delay={i * 90}>
          <div
            className={`card card-hover h-full p-7 flex flex-col relative overflow-hidden ${
              p.featured ? "ring-2 ring-[var(--color-zoom)] shadow-[0_30px_70px_-35px_rgba(10,108,255,0.55)]" : ""
            }`}
          >
            {p.featured && (
              <span className="absolute top-0 right-0 bg-[var(--color-zoom)] text-white text-xs font-semibold px-4 py-1.5 rounded-bl-2xl">
                Most popular
              </span>
            )}
            <span className="chip self-start capitalize">{p.audience}</span>
            <h3 className="display text-2xl text-[var(--color-heading)] mt-4">{p.name}</h3>
            <p className="text-[var(--color-slate)] text-sm mt-1 min-h-[40px]">{p.tagline}</p>

            {p.speed > 0 && (
              <div className="mt-5 flex items-end gap-3">
                <span className="text-5xl font-bold display text-blue-grad leading-none">{p.speed}</span>
                <span className="text-[var(--color-slate)] font-medium pb-1">Mbps</span>
              </div>
            )}

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-sm text-[var(--color-muted)]">JMD</span>
              <span className="text-2xl font-bold text-[var(--color-heading)]">${formatPrice(p.price)}</span>
              <span className="text-sm text-[var(--color-muted)]">/mo + GCT</span>
            </div>

            {!compact && (
              <ul className="mt-6 space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-[var(--color-slate)]">
                    <Check className="w-4 h-4 text-[var(--color-zoom)] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={`/contact?plan=${encodeURIComponent(p.name)}`}
              className={`btn mt-7 w-full ${p.featured ? "btn-primary" : "btn-ghost"}`}
            >
              Choose {p.name} <Arrow className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

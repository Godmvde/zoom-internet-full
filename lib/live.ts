import { cache } from "react";
import { cookies, headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { company as defaults } from "./content";

const SLUG = "zoom-internet-full";

// Reads live content from the central Retiar database (public, safe fields)
// merged over the built-in defaults. Falls back to defaults on any error.
export const getSite = cache(async () => {
  let d: Record<string, unknown> | null = null;
  let preview = false;
  try {
    const token =
      (await headers()).get("x-rtr-preview") ||
      (await cookies()).get("rtr_preview")?.value;
    preview = !!token;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://obnmvgmwgumavmtjpxdb.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_2-GCIZc8HgFCCRtw3OSMKg_h4SL55p9",
      {
        global: {
          fetch: (input: RequestInfo | URL, init?: RequestInit) =>
            fetch(input, { ...init, cache: "no-store" }),
        },
      },
    );
    if (token) {
      const { data } = await supabase.rpc("site_preview", {
        p_slug: SLUG,
        p_token: token,
      });
      d = (data as Record<string, unknown>) ?? null;
    }
    if (!d) {
      const { data } = await supabase.rpc("site_public", { p_slug: SLUG });
      d = (data as Record<string, unknown>) ?? null;
    }
  } catch {
    d = null;
  }

  const str = (k: string) =>
    typeof d?.[k] === "string" ? (d[k] as string).trim() : "";
  const isLive = d ? d.is_live !== false : true;

  const company = {
    ...defaults,
    name: str("business_name") || defaults.name,
    tagline: str("tagline") || defaults.tagline,
    blurb: str("about") || defaults.blurb,
    phone: str("phone") || defaults.phone,
    phoneHref: str("phone")
      ? `+${str("phone").replace(/[^0-9]/g, "")}`
      : defaults.phoneHref,
    email: str("email") || defaults.email,
    address: str("address") || defaults.location,
    location: str("address") || defaults.location,
  };

  const design = (d?.design as Record<string, unknown>) ?? {};
  const overrides = (d?.overrides as Record<string, string>) ?? {};
  // The published MULTI-PAGE Puck content: a map of route → Puck doc. Null until
  // an admin publishes a Puck layout, so pages keep rendering hand-coded JSX
  // until then. Each page reads puck?.["/thisroute"] and renders it via <Render>.
  const puck = (d?.puck as Record<string, unknown> | null) ?? null;

  return { isLive, company, design, preview, overrides, puck };
});

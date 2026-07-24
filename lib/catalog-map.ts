import { plans as staticPlans, type Plan } from "./content";

// Maps the shared Retiar products feed onto this site's Plan cards. Plans are
// managed in the Retiar Products tab (name, price, category = Residential/
// Business, and the Features bullet list). The prominent speed number is read
// from the first "N Mbps" feature; "Most popular" follows the client's Featured
// pick within each audience (falls back to the middle of three).

export const CATALOG_SLUG = "zoom-internet-full";

// Public Retiar Supabase. The anon/publishable key is safe in the client bundle
// (RLS-protected, and it ships in every site anyway). Env vars override if set.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://obnmvgmwgumavmtjpxdb.supabase.co";
export const SUPABASE_ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_2-GCIZc8HgFCCRtw3OSMKg_h4SL55p9";

export type DbProduct = {
  id: string;
  name: string;
  price: number | null;
  description: string | null;
  photos: string[] | null;
  category: string | null;
  sale_type: "none" | "sale" | "percent" | null;
  sale_price: number | null;
  percent_off: number | null;
  features: string[] | null;
  featured?: boolean | null;
};

export function mapPlans(rows: DbProduct[]): Plan[] {
  if (!rows.length) return staticPlans;

  const audienceOf = (r: DbProduct): "residential" | "business" =>
    (r.category ?? "").toLowerCase().includes("business") ? "business" : "residential";

  // Group by audience so "featured" (one per category) and the middle-card
  // fallback are decided WITHIN each audience.
  const byAudience = new Map<string, DbProduct[]>();
  for (const r of rows) {
    const a = audienceOf(r);
    const list = byAudience.get(a) ?? [];
    list.push(r);
    byAudience.set(a, list);
  }

  return rows.map((r) => {
    const audience = audienceOf(r);
    const group = byAudience.get(audience)!;
    const idxInGroup = group.indexOf(r);
    const groupHasFeatured = group.some((x) => x.featured);

    const features = r.features && r.features.length ? r.features : [];
    let speed = 0;
    for (const f of features) {
      const m = /(\d+)\s*mbps/i.exec(f);
      if (m) {
        speed = Number(m[1]);
        break;
      }
    }
    return {
      id: r.id,
      name: r.name,
      audience,
      speed,
      price: r.price ?? 0,
      tagline: r.description ?? "",
      features,
      featured: groupHasFeatured ? !!r.featured : group.length >= 3 && idxInGroup === 1,
    };
  });
}

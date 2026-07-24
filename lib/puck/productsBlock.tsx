import type { ReactNode } from "react";
import { ImageField } from "./ImageField";

// Self-contained image field (upload / drop / paste URL) so the block works on
// every site, even ones whose own components don't have image editing.
const imageFieldDef = {
  type: "custom" as const,
  label: "Photo",
  render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <ImageField value={value} onChange={onChange} />
  ),
};

// A standalone, self-contained Products / Services / Menu section that any site
// can add or remove like any other block. Each item has a name, price (with an
// optional sale — type a sale price OR a % off), a description (edit inline, or
// with ✨AI on Standard/Premium), and up to 6 photos. Theme-neutral styling so
// it fits every site. Register with:
//   Products: productsBlockConfig({ locked, canText, canPhotos, imageFieldDef })

type Item = {
  name?: ReactNode;
  description?: ReactNode;
  priceOriginal?: ReactNode;
  saleType?: "none" | "sale" | "percent";
  priceSale?: ReactNode;
  percentOff?: number;
  images?: { image?: string }[];
};

// Derive what price to show. The %-off path only computes when the original is a
// plain string (published site); in the editor the original is an inline-editor
// node, so we just show it (the discount previews after publish).
function prices(it: Item): { original: ReactNode; sale: ReactNode | null } {
  const original = it.priceOriginal;
  if (it.saleType === "sale" && it.priceSale) return { original, sale: it.priceSale };
  if (it.saleType === "percent" && it.percentOff && typeof original === "string") {
    const num = parseFloat(original.replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) {
      const discounted = num * (1 - Number(it.percentOff) / 100);
      const prefix = (original.match(/^[^\d]*/) || [""])[0];
      return { original, sale: prefix + discounted.toFixed(2).replace(/\.00$/, "") };
    }
  }
  return { original, sale: null };
}

function ProductCard({ item }: { item: Item }) {
  const imgs = (item.images ?? []).map((x) => x?.image).filter(Boolean).slice(0, 6) as string[];
  const { original, sale } = prices(item);
  return (
    <div style={{ border: "1px solid rgba(128,128,128,0.22)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {imgs[0] && <img src={imgs[0]} alt="" style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }} />}
      {imgs.length > 1 && (
        <div style={{ display: "flex", gap: 5, padding: "6px 8px 0", flexWrap: "wrap" }}>
          {imgs.slice(1, 6).map((src, i) => (
            <img key={i} src={src} alt="" style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 6 }} />
          ))}
        </div>
      )}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontWeight: 700, fontSize: "1.12rem", lineHeight: 1.3 }}>{item.name}</div>
        {(original != null && original !== "") && (
          <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            {sale ? (
              <>
                <span style={{ textDecoration: "line-through", opacity: 0.55 }}>{original}</span>
                <span style={{ fontWeight: 700 }}>{sale}</span>
              </>
            ) : (
              <span style={{ fontWeight: 700 }}>{original}</span>
            )}
          </div>
        )}
        {(item.description != null && item.description !== "") && (
          <div style={{ opacity: 0.78, lineHeight: 1.55, fontSize: "0.96rem" }}>{item.description}</div>
        )}
      </div>
    </div>
  );
}

export function ProductsBlockView({ heading, items }: { heading?: ReactNode; items?: Item[] }) {
  const list = items ?? [];
  return (
    <section style={{ padding: "clamp(48px, 8vw, 88px) 20px" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        {heading != null && heading !== "" && (
          <h2 style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15, textAlign: "center", marginBottom: "clamp(24px, 4vw, 44px)" }}>{heading}</h2>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 22 }}>
          {list.map((it, i) => <ProductCard key={i} item={it} />)}
        </div>
      </div>
    </section>
  );
}

type Opts = { locked?: object; canText?: boolean; canPhotos?: boolean };

export function productsBlockConfig({ locked, canText = true, canPhotos = canText }: Opts) {
  return {
    label: "Products / Services",
    fields: {
      heading: { type: "text" as const },
      items: {
        type: "array" as const,
        label: "Items",
        getItemSummary: (item: { name?: string }, i?: number) => item?.name || `Item ${(i ?? 0) + 1}`,
        arrayFields: {
          name: { type: "text" as const, label: "Name" },
          priceOriginal: { type: "text" as const, label: "Price (e.g. $50)" },
          saleType: {
            type: "select" as const,
            label: "Sale",
            options: [
              { label: "No sale", value: "none" },
              { label: "Sale price", value: "sale" },
              { label: "% off", value: "percent" },
            ],
          },
          priceSale: { type: "text" as const, label: "Sale price (if 'Sale price')" },
          percentOff: { type: "number" as const, label: "% off (if '% off')" },
          description: { type: "textarea" as const, label: "Description (✨AI on Standard/Premium)" },
          images: {
            type: "array" as const,
            label: "Photos (up to 6)",
            getItemSummary: (_i: unknown, i?: number) => `Photo ${(i ?? 0) + 1}`,
            arrayFields: { image: imageFieldDef },
          },
        },
      },
    },
    defaultProps: {
      heading: "Our products",
      items: [
        { name: "Product one", priceOriginal: "$50", saleType: "none", description: "A short description of what this is and why it's great.", images: [] },
        { name: "Product two", priceOriginal: "$80", saleType: "percent", percentOff: 20, description: "Another item — set a sale price or a % off in the panel.", images: [] },
      ],
    },
    permissions: locked,
    resolveData: ({ props }: { props: unknown }) => ({
      props,
      readOnly: { heading: !canText, items: !canText && !canPhotos },
    }),
    render: ({ heading, items }: { heading?: ReactNode; items?: Item[] }) => (
      <ProductsBlockView heading={heading} items={items} />
    ),
  };
}

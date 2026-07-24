import type { ReactNode } from "react";

// Standalone, theme-neutral Pricing table — tiers with a price, period and a
// newline-separated feature list. One tier can be highlighted. Register with:
//   Pricing: pricingBlockConfig({ locked, canText })

type Tier = {
  name?: ReactNode;
  price?: ReactNode;
  period?: ReactNode;
  features?: ReactNode;
  highlighted?: boolean;
};

// Features are one per line. In the editor the value may be an inline node, so we
// only split when it's a plain string (published site); otherwise render as-is.
function featureList(features?: ReactNode): ReactNode {
  if (typeof features === "string") {
    const lines = features.split("\n").map((l) => l.trim()).filter(Boolean);
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {lines.map((l, i) => (
          <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5 }}>
            <span aria-hidden style={{ opacity: 0.7 }}>✓</span>
            <span style={{ opacity: 0.85 }}>{l}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (features != null && features !== "") {
    return <div style={{ marginTop: 18, opacity: 0.85, whiteSpace: "pre-line", lineHeight: 1.6 }}>{features}</div>;
  }
  return null;
}

export function PricingBlockView({
  heading,
  items,
}: {
  heading?: ReactNode;
  items?: Tier[];
}) {
  const list = items ?? [];
  return (
    <section style={{ padding: "clamp(48px, 8vw, 88px) 20px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {heading != null && heading !== "" && (
          <h2 style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15, textAlign: "center", marginBottom: "clamp(24px, 4vw, 44px)" }}>
            {heading}
          </h2>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, alignItems: "start" }}>
          {list.map((it, i) => (
            <div
              key={i}
              style={{
                border: it.highlighted ? "2px solid currentColor" : "1px solid rgba(128,128,128,0.24)",
                borderRadius: 18,
                padding: "28px 26px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "1.15rem" }}>{it.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 12 }}>
                <span style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, lineHeight: 1 }}>{it.price}</span>
                {it.period != null && it.period !== "" && (
                  <span style={{ opacity: 0.6, fontSize: "0.95rem" }}>{it.period}</span>
                )}
              </div>
              {featureList(it.features)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Opts = { locked?: object; canText?: boolean };

export function pricingBlockConfig({ locked, canText = true }: Opts) {
  return {
    label: "Pricing table",
    fields: {
      heading: { type: "text" as const },
      items: {
        type: "array" as const,
        label: "Plans",
        getItemSummary: (item: { name?: string }, i?: number) => item?.name || `Plan ${(i ?? 0) + 1}`,
        arrayFields: {
          name: { type: "text" as const, label: "Plan name" },
          price: { type: "text" as const, label: "Price (e.g. $49)" },
          period: { type: "text" as const, label: "Period (e.g. /mo)" },
          features: { type: "textarea" as const, label: "Features (one per line)" },
          highlighted: {
            type: "radio" as const,
            label: "Highlight",
            options: [
              { label: "Normal", value: false },
              { label: "Highlighted", value: true },
            ],
          },
        },
      },
    },
    defaultProps: {
      heading: "Pricing",
      items: [
        { name: "Basic", price: "$49", period: "/mo", features: "One-page website\nHosting & SSL\nEdit anytime", highlighted: false },
        { name: "Standard", price: "$99", period: "/mo", features: "Everything in Basic\nMulti-page site\nPriority fixes", highlighted: true },
        { name: "Premium", price: "$199", period: "/mo", features: "Everything in Standard\nCustom design\nPriority support", highlighted: false },
      ],
    },
    permissions: locked,
    resolveData: ({ props }: { props: unknown }) => ({
      props,
      readOnly: { heading: !canText, items: !canText },
    }),
    render: ({ heading, items }: { heading?: ReactNode; items?: Tier[] }) => (
      <PricingBlockView heading={heading} items={items} />
    ),
  };
}

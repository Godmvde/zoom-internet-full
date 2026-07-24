import type { ReactNode } from "react";

// Standalone, theme-neutral Stats / Numbers row — big metric + label. Register:
//   Stats: statsBlockConfig({ locked, canText })

type Stat = { value?: ReactNode; label?: ReactNode };

export function StatsBlockView({
  heading,
  items,
}: {
  heading?: ReactNode;
  items?: Stat[];
}) {
  const list = items ?? [];
  return (
    <section style={{ padding: "clamp(44px, 7vw, 80px) 20px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {heading != null && heading !== "" && (
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700, lineHeight: 1.15, textAlign: "center", marginBottom: "clamp(20px, 4vw, 40px)" }}>
            {heading}
          </h2>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 20, textAlign: "center" }}>
          {list.map((it, i) => (
            <div key={i} style={{ padding: "12px 8px" }}>
              <div style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1 }}>{it.value}</div>
              <div style={{ marginTop: 8, opacity: 0.7, fontSize: "0.98rem" }}>{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Opts = { locked?: object; canText?: boolean };

export function statsBlockConfig({ locked, canText = true }: Opts) {
  return {
    label: "Stats / Numbers",
    fields: {
      heading: { type: "text" as const },
      items: {
        type: "array" as const,
        label: "Numbers",
        getItemSummary: (item: { label?: string }, i?: number) => item?.label || `Stat ${(i ?? 0) + 1}`,
        arrayFields: {
          value: { type: "text" as const, label: "Value (e.g. 500+)" },
          label: { type: "text" as const, label: "Label" },
        },
      },
    },
    defaultProps: {
      heading: "",
      items: [
        { value: "500+", label: "Happy customers" },
        { value: "12", label: "Years in business" },
        { value: "4.9★", label: "Average rating" },
        { value: "24/7", label: "Support" },
      ],
    },
    permissions: locked,
    resolveData: ({ props }: { props: unknown }) => ({
      props,
      readOnly: { heading: !canText, items: !canText },
    }),
    render: ({ heading, items }: { heading?: ReactNode; items?: Stat[] }) => (
      <StatsBlockView heading={heading} items={items} />
    ),
  };
}

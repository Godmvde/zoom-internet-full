import type { ReactNode } from "react";

// Standalone, theme-neutral Feature grid — an emoji/icon, title and text per
// column (services, benefits, "why us"). Register with:
//   Features: featureGridBlockConfig({ locked, canText })

type Feature = { icon?: ReactNode; title?: ReactNode; text?: ReactNode };

export function FeatureGridBlockView({
  heading,
  items,
}: {
  heading?: ReactNode;
  items?: Feature[];
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 22 }}>
          {list.map((it, i) => (
            <div key={i} style={{ border: "1px solid rgba(128,128,128,0.22)", borderRadius: 16, padding: "26px 22px" }}>
              {it.icon != null && it.icon !== "" && (
                <div aria-hidden style={{ fontSize: "1.9rem", lineHeight: 1, marginBottom: 12 }}>{it.icon}</div>
              )}
              <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 6 }}>{it.title}</div>
              {it.text != null && it.text !== "" && (
                <div style={{ opacity: 0.76, lineHeight: 1.6, fontSize: "0.98rem" }}>{it.text}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Opts = { locked?: object; canText?: boolean };

export function featureGridBlockConfig({ locked, canText = true }: Opts) {
  return {
    label: "Feature grid",
    fields: {
      heading: { type: "text" as const },
      items: {
        type: "array" as const,
        label: "Features",
        getItemSummary: (item: { title?: string }, i?: number) => item?.title || `Feature ${(i ?? 0) + 1}`,
        arrayFields: {
          icon: { type: "text" as const, label: "Icon (emoji)" },
          title: { type: "text" as const, label: "Title" },
          text: { type: "textarea" as const, label: "Text" },
        },
      },
    },
    defaultProps: {
      heading: "Why choose us",
      items: [
        { icon: "⭐", title: "Quality first", text: "We never cut corners — every job is done properly, the first time." },
        { icon: "⚡", title: "Fast & reliable", text: "On time, every time. We respect your schedule as much as our own." },
        { icon: "💬", title: "Always here", text: "Questions? We're friendly, responsive and happy to help." },
      ],
    },
    permissions: locked,
    resolveData: ({ props }: { props: unknown }) => ({
      props,
      readOnly: { heading: !canText, items: !canText },
    }),
    render: ({ heading, items }: { heading?: ReactNode; items?: Feature[] }) => (
      <FeatureGridBlockView heading={heading} items={items} />
    ),
  };
}

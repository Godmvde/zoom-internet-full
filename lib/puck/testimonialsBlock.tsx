import type { ReactNode } from "react";

// Standalone, theme-neutral Testimonials section — customer quotes with a name
// and role. Add/remove/move gated by `locked`; the quote rows are an array field
// (clients with Text can add/edit them). Register with:
//   Testimonials: testimonialsBlockConfig({ locked, canText })

type Quote = { quote?: ReactNode; name?: ReactNode; role?: ReactNode };

export function TestimonialsBlockView({
  heading,
  items,
}: {
  heading?: ReactNode;
  items?: Quote[];
}) {
  const list = items ?? [];
  return (
    <section style={{ padding: "clamp(48px, 8vw, 88px) 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {heading != null && heading !== "" && (
          <h2 style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15, textAlign: "center", marginBottom: "clamp(24px, 4vw, 44px)" }}>
            {heading}
          </h2>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {list.map((it, i) => (
            <figure key={i} style={{ margin: 0, border: "1px solid rgba(128,128,128,0.24)", borderRadius: 16, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div aria-hidden style={{ fontSize: "2.2rem", lineHeight: 0.6, opacity: 0.35 }}>&ldquo;</div>
              <blockquote style={{ margin: 0, fontSize: "1.05rem", lineHeight: 1.6 }}>{it.quote}</blockquote>
              <figcaption style={{ marginTop: "auto", paddingTop: 6 }}>
                <div style={{ fontWeight: 700 }}>{it.name}</div>
                {it.role != null && it.role !== "" && (
                  <div style={{ opacity: 0.66, fontSize: "0.9rem" }}>{it.role}</div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

type Opts = { locked?: object; canText?: boolean };

export function testimonialsBlockConfig({ locked, canText = true }: Opts) {
  return {
    label: "Testimonials",
    fields: {
      heading: { type: "text" as const },
      items: {
        type: "array" as const,
        label: "Quotes",
        getItemSummary: (item: { name?: string }, i?: number) => item?.name || `Quote ${(i ?? 0) + 1}`,
        arrayFields: {
          quote: { type: "textarea" as const, label: "Quote" },
          name: { type: "text" as const, label: "Name" },
          role: { type: "text" as const, label: "Role / company" },
        },
      },
    },
    defaultProps: {
      heading: "What people say",
      items: [
        { quote: "Genuinely the best experience we've had — friendly, professional and worth every penny.", name: "Sarah T.", role: "Regular customer" },
        { quote: "They went above and beyond. I recommend them to everyone I know.", name: "Marcus B.", role: "Local resident" },
        { quote: "Reliable, fair and always a pleasure to deal with. Five stars.", name: "Anita R.", role: "Business owner" },
      ],
    },
    permissions: locked,
    resolveData: ({ props }: { props: unknown }) => ({
      props,
      readOnly: { heading: !canText, items: !canText },
    }),
    render: ({ heading, items }: { heading?: ReactNode; items?: Quote[] }) => (
      <TestimonialsBlockView heading={heading} items={items} />
    ),
  };
}

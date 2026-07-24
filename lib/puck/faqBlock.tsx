import type { ReactNode } from "react";

// A standalone, self-contained FAQ section that any site can add or remove like
// any other block. Theme-neutral styling (inherits the page's color + font,
// borders via translucent grey) so it looks right on every site — light or dark.
//
// Editing model (matches the requested permissions):
//   • the whole section is a Puck block → add/remove/move gated by `locked`
//     (admins only; clients have layout locked)
//   • the Q&A rows are an array field → clients WITH text editing can add/remove
//     individual questions and edit them inline
//
// Register it in a site's config with:  FAQ: faqBlockConfig({ locked, canText })

export function FaqBlockView({
  heading,
  items,
}: {
  heading?: ReactNode;
  items?: { question?: ReactNode; answer?: ReactNode }[];
}) {
  const list = items ?? [];
  return (
    <section style={{ padding: "clamp(48px, 8vw, 88px) 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {heading != null && heading !== "" && (
          <h2 style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15, textAlign: "center", marginBottom: "clamp(24px, 4vw, 40px)" }}>
            {heading}
          </h2>
        )}
        <div style={{ borderTop: "1px solid rgba(128,128,128,0.28)" }}>
          {list.map((it, i) => (
            <div key={i} style={{ borderBottom: "1px solid rgba(128,128,128,0.28)", padding: "20px 2px" }}>
              <div style={{ fontWeight: 600, fontSize: "1.08rem", lineHeight: 1.4, marginBottom: 8 }}>{it.question}</div>
              <div style={{ opacity: 0.78, lineHeight: 1.65 }}>{it.answer}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type FaqOpts = { locked?: object; canText?: boolean };

export function faqBlockConfig({ locked, canText = true }: FaqOpts) {
  return {
    label: "FAQ",
    fields: {
      heading: { type: "text" as const },
      items: {
        type: "array" as const,
        label: "Questions",
        getItemSummary: (item: { question?: string }, i?: number) => item?.question || `Question ${(i ?? 0) + 1}`,
        arrayFields: {
          question: { type: "text" as const, label: "Question" },
          answer: { type: "textarea" as const, label: "Answer" },
        },
      },
    },
    defaultProps: {
      heading: "Frequently asked questions",
      items: [
        { question: "What are your hours?", answer: "We're open daily — reach out and we'll confirm the exact times for your visit." },
        { question: "Where are you located?", answer: "You'll find our address in the footer — tap it for directions." },
        { question: "How do I get in touch?", answer: "Use the contact details on this page and we'll get right back to you." },
      ],
    },
    permissions: locked,
    resolveData: ({ props }: { props: unknown }) => ({
      props,
      readOnly: { heading: !canText, items: !canText },
    }),
    render: ({ heading, items }: { heading?: ReactNode; items?: { question?: ReactNode; answer?: ReactNode }[] }) => (
      <FaqBlockView heading={heading} items={items} />
    ),
  };
}

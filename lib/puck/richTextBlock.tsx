import type { ReactNode } from "react";

// Standalone, theme-neutral Rich text section — a heading and body paragraphs for
// any custom content (about, notices, policies…). The universal catch-all block.
// Register with:  RichText: richTextBlockConfig({ locked, canText })

export function RichTextBlockView({
  heading,
  body,
  align,
}: {
  heading?: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
}) {
  const textAlign = align === "center" ? "center" : "left";
  return (
    <section style={{ padding: "clamp(44px, 7vw, 80px) 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign }}>
        {heading != null && heading !== "" && (
          <h2 style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.3rem)", fontWeight: 700, lineHeight: 1.18, marginBottom: 18 }}>
            {heading}
          </h2>
        )}
        {body != null && body !== "" && (
          <div style={{ opacity: 0.82, lineHeight: 1.75, fontSize: "1.05rem", whiteSpace: "pre-line" }}>{body}</div>
        )}
      </div>
    </section>
  );
}

type Opts = { locked?: object; canText?: boolean };

export function richTextBlockConfig({ locked, canText = true }: Opts) {
  return {
    label: "Rich text",
    fields: {
      heading: { type: "text" as const, label: "Heading" },
      body: { type: "textarea" as const, label: "Body" },
      align: {
        type: "radio" as const,
        label: "Alignment",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
        ],
      },
    },
    defaultProps: {
      heading: "About us",
      body: "Tell your story here. Share what you do, what makes you different, and why customers keep coming back.\n\nAdd as many paragraphs as you like — leave a blank line between them.",
      align: "left",
    },
    permissions: locked,
    resolveData: ({ props }: { props: unknown }) => ({
      props,
      readOnly: { heading: !canText, body: !canText, align: !canText },
    }),
    render: ({ heading, body, align }: { heading?: ReactNode; body?: ReactNode; align?: "left" | "center" }) => (
      <RichTextBlockView heading={heading} body={body} align={align} />
    ),
  };
}

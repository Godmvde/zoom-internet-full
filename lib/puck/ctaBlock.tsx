import type { ReactNode } from "react";

// Standalone, theme-neutral call-to-action banner — headline, blurb and a button
// (label + link). Theme-neutral: a translucent panel that reads on light or dark.
// Register with:  CTA: ctaBlockConfig({ locked, canText })

export function CtaBlockView({
  heading,
  text,
  buttonLabel,
  buttonHref,
}: {
  heading?: ReactNode;
  text?: ReactNode;
  buttonLabel?: ReactNode;
  buttonHref?: string;
}) {
  const href = typeof buttonHref === "string" && buttonHref.trim() ? buttonHref.trim() : "#";
  const hasButton = buttonLabel != null && buttonLabel !== "";
  return (
    <section style={{ padding: "clamp(40px, 7vw, 80px) 20px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", border: "1px solid rgba(128,128,128,0.24)", background: "rgba(128,128,128,0.08)", borderRadius: 22, padding: "clamp(32px, 6vw, 60px) clamp(24px, 5vw, 56px)", textAlign: "center" }}>
        {heading != null && heading !== "" && (
          <h2 style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.6rem)", fontWeight: 800, lineHeight: 1.12, margin: 0 }}>{heading}</h2>
        )}
        {text != null && text !== "" && (
          <p style={{ maxWidth: 620, margin: "16px auto 0", opacity: 0.78, fontSize: "1.05rem", lineHeight: 1.6 }}>{text}</p>
        )}
        {hasButton && (
          <div style={{ marginTop: 28 }}>
            <a href={href} style={{ display: "inline-block", padding: "13px 30px", borderRadius: 999, border: "1.5px solid currentColor", color: "inherit", fontWeight: 700, textDecoration: "none" }}>
              {buttonLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

type Opts = { locked?: object; canText?: boolean };

export function ctaBlockConfig({ locked, canText = true }: Opts) {
  return {
    label: "CTA banner",
    fields: {
      heading: { type: "text" as const, label: "Headline" },
      text: { type: "textarea" as const, label: "Text" },
      buttonLabel: { type: "text" as const, label: "Button label" },
      buttonHref: { type: "text" as const, label: "Button link (URL, tel: or mailto:)" },
    },
    defaultProps: {
      heading: "Ready to get started?",
      text: "Get in touch today and we'll take it from there.",
      buttonLabel: "Contact us",
      buttonHref: "#contact",
    },
    permissions: locked,
    resolveData: ({ props }: { props: unknown }) => ({
      props,
      readOnly: { heading: !canText, text: !canText, buttonLabel: !canText, buttonHref: !canText },
    }),
    render: ({ heading, text, buttonLabel, buttonHref }: { heading?: ReactNode; text?: ReactNode; buttonLabel?: ReactNode; buttonHref?: string }) => (
      <CtaBlockView heading={heading} text={text} buttonLabel={buttonLabel} buttonHref={buttonHref} />
    ),
  };
}

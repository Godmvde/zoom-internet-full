import type { ReactNode } from "react";
import { ImageField } from "./ImageField";

// Standalone, theme-neutral Gallery — a responsive grid of photos any site can
// add or remove. Photos are gated by the client's Photos cap. Register with:
//   Gallery: galleryBlockConfig({ locked, canPhotos })

const imageFieldDef = {
  type: "custom" as const,
  label: "Photo",
  render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <ImageField value={value} onChange={onChange} />
  ),
};

type Shot = { image?: string; caption?: ReactNode };

export function GalleryBlockView({
  heading,
  items,
}: {
  heading?: ReactNode;
  items?: Shot[];
}) {
  const list = (items ?? []).filter((s) => s?.image);
  return (
    <section style={{ padding: "clamp(48px, 8vw, 88px) 20px" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        {heading != null && heading !== "" && (
          <h2 style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15, textAlign: "center", marginBottom: "clamp(24px, 4vw, 44px)" }}>
            {heading}
          </h2>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {list.map((it, i) => (
            <figure key={i} style={{ margin: 0, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(128,128,128,0.18)" }}>
              <img src={it.image} alt="" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }} />
              {it.caption != null && it.caption !== "" && (
                <figcaption style={{ padding: "8px 10px", fontSize: "0.85rem", opacity: 0.72 }}>{it.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

type Opts = { locked?: object; canPhotos?: boolean };

export function galleryBlockConfig({ locked, canPhotos = true }: Opts) {
  return {
    label: "Gallery",
    fields: {
      heading: { type: "text" as const },
      items: {
        type: "array" as const,
        label: "Photos",
        getItemSummary: (_i: unknown, i?: number) => `Photo ${(i ?? 0) + 1}`,
        arrayFields: {
          image: imageFieldDef,
          caption: { type: "text" as const, label: "Caption (optional)" },
        },
      },
    },
    defaultProps: {
      heading: "Gallery",
      items: [{ image: "" }, { image: "" }, { image: "" }],
    },
    permissions: locked,
    resolveData: ({ props }: { props: unknown }) => ({
      props,
      readOnly: { heading: !canPhotos, items: !canPhotos },
    }),
    render: ({ heading, items }: { heading?: ReactNode; items?: Shot[] }) => (
      <GalleryBlockView heading={heading} items={items} />
    ),
  };
}

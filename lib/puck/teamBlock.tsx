import type { ReactNode } from "react";
import { ImageField } from "./ImageField";

// Standalone, theme-neutral Team section — a photo, name, role and short bio per
// person. Photos gated by the Photos cap; the text by the Text cap. Register:
//   Team: teamBlockConfig({ locked, canText, canPhotos })

const imageFieldDef = {
  type: "custom" as const,
  label: "Photo",
  render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <ImageField value={value} onChange={onChange} />
  ),
};

type Member = { photo?: string; name?: ReactNode; role?: ReactNode; bio?: ReactNode };

export function TeamBlockView({
  heading,
  items,
}: {
  heading?: ReactNode;
  items?: Member[];
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
          {list.map((it, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ width: 120, height: 120, margin: "0 auto 14px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(128,128,128,0.24)", background: "rgba(128,128,128,0.12)" }}>
                {it.photo && <img src={it.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.08rem" }}>{it.name}</div>
              {it.role != null && it.role !== "" && (
                <div style={{ opacity: 0.66, fontSize: "0.9rem", marginTop: 2 }}>{it.role}</div>
              )}
              {it.bio != null && it.bio !== "" && (
                <div style={{ opacity: 0.78, fontSize: "0.92rem", lineHeight: 1.55, marginTop: 8 }}>{it.bio}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Opts = { locked?: object; canText?: boolean; canPhotos?: boolean };

export function teamBlockConfig({ locked, canText = true, canPhotos = canText }: Opts) {
  return {
    label: "Team",
    fields: {
      heading: { type: "text" as const },
      items: {
        type: "array" as const,
        label: "People",
        getItemSummary: (item: { name?: string }, i?: number) => item?.name || `Person ${(i ?? 0) + 1}`,
        arrayFields: {
          photo: imageFieldDef,
          name: { type: "text" as const, label: "Name" },
          role: { type: "text" as const, label: "Role" },
          bio: { type: "textarea" as const, label: "Short bio (optional)" },
        },
      },
    },
    defaultProps: {
      heading: "Meet the team",
      items: [
        { photo: "", name: "Team member", role: "Owner" },
        { photo: "", name: "Team member", role: "Manager" },
        { photo: "", name: "Team member", role: "Specialist" },
      ],
    },
    permissions: locked,
    resolveData: ({ props }: { props: unknown }) => ({
      props,
      readOnly: { heading: !canText, items: !canText && !canPhotos },
    }),
    render: ({ heading, items }: { heading?: ReactNode; items?: Member[] }) => (
      <TeamBlockView heading={heading} items={items} />
    ),
  };
}

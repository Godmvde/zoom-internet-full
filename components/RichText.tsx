import { renderRich } from "@/lib/richtext";

// Renders prose fields that may contain rich-text markdown (bold / italic /
// links) as safe HTML. Plain text with no markdown renders identically to the
// raw string, so wrapping an existing field in <RichText> is a no-op until
// someone actually formats something. `renderRich` guarantees XSS-safe output.
export function RichText({
  md,
  className,
  as: Tag = "span",
}: {
  md?: string;
  className?: string;
  as?: "span" | "p" | "div";
}) {
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: renderRich(md ?? "") }} />
  );
}

import { type ReactNode } from "react";
import { RichText } from "@/components/RichText";

// Renders a prose field. On the public site the value is a markdown STRING →
// rendered formatted by <RichText> (lightweight, no editor library). In the
// Studio edit canvas the value is Puck's own inline-text editor NODE (the same
// reliable editor the plain text fields use) → wrapped in [data-rtr-rich] so the
// floating B/I/Link toolbar (StudioProseEdit) can target it.
export function Prose({ value }: { value: ReactNode }) {
  if (typeof value === "string") return <RichText md={value} />;
  return <span data-rtr-rich="">{value}</span>;
}

// Text-override resolver for the Retiar Studio "edit every text" feature.
// Given the per-site `overrides` map (key -> client-edited text), returns a
// `t(key, fallback)` that yields the override when present and non-empty,
// otherwise the built-in default. Works in both server and client components
// (the overrides map is a plain serializable object).
import type { ReactNode } from "react";

// The override map holds plain strings on the public site. Inside the Studio's
// edit canvas, Puck swaps an inline-editable field's value for a React node (a
// contentEditable span), so the map is widened to ReactNode.
export type Overrides = Record<string, ReactNode>;

export function makeT(overrides: Overrides | null | undefined) {
  return (key: string, fallback: string): string => {
    const v = overrides?.[key];
    if (typeof v === "string") return v.trim() ? v : fallback;
    // Studio edit mode only: Puck's inline-text editor passes a React node here.
    // It always lands in child position (never in src/href/alt/markdown), so we
    // hand it straight back to be rendered. The public <Render> path never hits
    // this branch — it always supplies plain strings.
    if (v != null && v !== false) return v as unknown as string;
    return fallback;
  };
}

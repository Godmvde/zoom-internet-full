// Per-element design layer for the Studio inspector.
//
// Every editable slot in a site component carries a `data-rtr-field="ov:…"`
// attribute. We store a style per field key and emit plain CSS that targets that
// attribute — so ONE mechanism styles every element, with zero per-component
// edits, and it renders identically in the Studio canvas and the public page
// (both go through Puck's <Render> + the config's root.render, which emits this
// CSS). Styles live in the Puck data at root.props.elementStyles, so they save
// and publish automatically.

export type Shadow = { x: number; y: number; blur: number; color: string };
export type Glow = { color: string; size: number };
export type Stroke = { width: number; color: string };
export type Gradient = { from: string; to: string; angle: number };
export type HoverFx = "lift" | "grow" | "glow";
export type PressFx = "shrink" | "push";
export type LoopFx = "float" | "pulse" | "shimmer";
export type ScrollFx = "fadeup" | "slidein" | "zoomin";
export type AppearFx = "fade" | "rise" | "zoom" | "blur" | "flip" | "bounce";

export type SlotStyle = {
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: "italic";
  textDecoration?: "underline" | "line-through" | "underline line-through";
  fontSize?: number; // px
  lineHeight?: number; // unitless
  letterSpacing?: number; // px (may be negative)
  color?: string;
  textAlign?: "left" | "center" | "right";
  textShadow?: Shadow | null;
  mobileFontSize?: number; // responsive override for ≤640px
  // Visual effects (admin only)
  glow?: Glow | null;
  stroke?: Stroke | null;
  gradient?: Gradient | null;
  // Animation presets (admin only)
  hover?: HoverFx | null;
  press?: PressFx | null;
  loop?: LoopFx | null;
  scroll?: ScrollFx | null;
  appear?: AppearFx | null; // plays once on page load
};

export type ElementStyles = Record<string, SlotStyle>;

export type RootDesignProps = {
  elementStyles?: ElementStyles;
  fonts?: string[]; // Google font families in use
};

function decls(s: SlotStyle): string {
  const d: string[] = [];
  if (s.fontFamily) d.push(`font-family:'${s.fontFamily}',ui-sans-serif,system-ui,sans-serif`);
  if (s.fontWeight != null) d.push(`font-weight:${s.fontWeight}`);
  if (s.fontStyle) d.push(`font-style:${s.fontStyle}`);
  if (s.textDecoration) d.push(`text-decoration:${s.textDecoration}`);
  if (s.fontSize != null) d.push(`font-size:${s.fontSize}px`);
  if (s.lineHeight != null) d.push(`line-height:${s.lineHeight}`);
  if (s.letterSpacing != null) d.push(`letter-spacing:${s.letterSpacing}px`);
  if (s.textAlign) d.push(`text-align:${s.textAlign}`);
  // text-shadow = drop shadow + glow, combined
  const shadows: string[] = [];
  if (s.textShadow) shadows.push(`${s.textShadow.x}px ${s.textShadow.y}px ${s.textShadow.blur}px ${s.textShadow.color}`);
  if (s.glow) shadows.push(`0 0 ${s.glow.size}px ${s.glow.color}`, `0 0 ${s.glow.size * 2}px ${s.glow.color}`);
  if (shadows.length) d.push(`text-shadow:${shadows.join(",")}`);
  if (s.stroke && s.stroke.width > 0) {
    d.push(`-webkit-text-stroke:${s.stroke.width}px ${s.stroke.color}`);
    d.push(`paint-order:stroke fill`);
  }
  // Gradient fill overrides plain color (fills the glyphs with a gradient).
  if (s.gradient) {
    d.push(`background-image:linear-gradient(${s.gradient.angle}deg,${s.gradient.from},${s.gradient.to})`);
    d.push(`-webkit-background-clip:text`, `background-clip:text`, `-webkit-text-fill-color:transparent`, `color:transparent`);
  } else if (s.color) {
    d.push(`color:${s.color}`);
  }
  // !important so these beat the component's hardcoded Tailwind utility classes.
  return d.map((x) => x + " !important").join(";");
}

const KEYFRAMES =
  "@keyframes rtr-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}" +
  "@keyframes rtr-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}" +
  "@keyframes rtr-shimmer{0%{opacity:.55}50%{opacity:1}100%{opacity:.55}}" +
  "@keyframes rtr-appear-fade{from{opacity:0}to{opacity:1}}" +
  "@keyframes rtr-appear-rise{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}" +
  "@keyframes rtr-appear-zoom{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}" +
  "@keyframes rtr-appear-blur{from{opacity:0;filter:blur(12px)}to{opacity:1;filter:blur(0)}}" +
  "@keyframes rtr-appear-flip{from{opacity:0;transform:perspective(600px) rotateX(-45deg)}to{opacity:1;transform:none}}" +
  "@keyframes rtr-appear-bounce{0%{opacity:0;transform:translateY(30px)}60%{opacity:1;transform:translateY(-9px)}100%{transform:none}}";

// Animation CSS for one slot (NOT !important — additive transforms/animations).
function animationCss(sel: string, s: SlotStyle): string {
  let css = "";
  if (s.hover) {
    css += `${sel}{transition:transform .28s ease,box-shadow .28s ease,filter .28s ease}`;
    if (s.hover === "lift") css += `${sel}:hover{transform:translateY(-6px);box-shadow:0 12px 28px rgba(0,0,0,.28)}`;
    if (s.hover === "grow") css += `${sel}:hover{transform:scale(1.06)}`;
    if (s.hover === "glow") css += `${sel}:hover{filter:drop-shadow(0 0 10px currentColor)}`;
  }
  if (s.press === "shrink") css += `${sel}:active{transform:scale(.94)}`;
  if (s.press === "push") css += `${sel}:active{transform:translateY(3px)}`;
  // appear (on page load) + loop combine into one animation shorthand
  const anims: string[] = [];
  if (s.appear) anims.push(`rtr-appear-${s.appear} .7s ease both`);
  if (s.loop) {
    const m = { float: "rtr-float 3s ease-in-out infinite", pulse: "rtr-pulse 2s ease-in-out infinite", shimmer: "rtr-shimmer 2.4s linear infinite" };
    anims.push(s.appear ? m[s.loop].replace(/(\d+(\.\d+)?)s /, "$1s .7s ") : m[s.loop]);
  }
  if (anims.length) css += `${sel}{animation:${anims.join(",")}}`;
  if (s.scroll) {
    const hidden = { fadeup: "opacity:0;transform:translateY(28px)", slidein: "opacity:0;transform:translateX(-40px)", zoomin: "opacity:0;transform:scale(.9)" };
    css += `${sel}{${hidden[s.scroll]};transition:opacity .7s ease,transform .7s ease}`;
    css += `${sel}[data-rtr-inview]{opacity:1;transform:none}`;
  }
  return css;
}

// Only the [data-rtr-field] value is interpolated; it's a fixed set of dotted
// keys ("ov:hero.headline") with no quotes, so it is safe inside a "…" selector.
export function stylesToCss(map?: ElementStyles): string {
  if (!map) return "";
  let base = "";
  let anim = "";
  let editorShow = "";
  const mobile: string[] = [];
  for (const [key, s] of Object.entries(map)) {
    if (!key.startsWith("ov:")) continue;
    const sel = `[data-rtr-field="${key}"]`;
    const d = decls(s);
    if (d) base += `${sel}{${d}}`;
    if (s.mobileFontSize != null) mobile.push(`${sel}{font-size:${s.mobileFontSize}px !important}`);
    anim += animationCss(sel, s);
    // In the editor, scroll-animated elements must NOT stay hidden (opacity:0)
    // while you're editing them — force them visible there.
    if (s.scroll) editorShow += `[data-puck-preview-mode=edit] ${sel}{opacity:1 !important;transform:none !important;animation:none !important}`;
  }
  if (mobile.length) base += `@media(max-width:640px){${mobile.join("")}}`;
  if (anim) base += anim + KEYFRAMES;
  if (editorShow) base += editorShow;
  return base;
}

// Injected into the canvas via root.render. Makes Puck's on-canvas editable
// outlines SOLID (not dashed) + subtle blue, so the only prominent border is our
// selection box. Rules only match in the editor (data-puck-preview-mode=edit),
// so they're inert on the published site.
export const EDIT_CANVAS_CSS =
  // Studio editor canvas only. Puck's DraggableComponent overlays render as
  // direct children of <body> (NOT inside [data-puck-entry] — that wraps the
  // rendered component content, a *descendant* of the overlay), so anchoring
  // these rules to [data-puck-entry] made every one of them silently miss. We
  // target the overlay classes / Puck variables directly: they exist only inside
  // the editor iframe, so this whole block is inert on the published site
  // (root.render emits it in both). Goal: hover & selection show a thin BORDER
  // only — never Puck's default fill/tint.
  // 1) Zero the variables Puck derives the fill from (belt).
  ":root{--puck-color-selection-bg:transparent !important;--puck-color-highlight:transparent !important;--puck-slot-color-bg:transparent !important;--puck-slot-component-color-overlay:transparent !important;}" +
  // 2) Every overlay + dropzone: no fill, no shadow (suspenders — !important beats
  //    Puck's own class rule regardless of its specificity).
  "[class*=\"DraggableComponent-overlay\"],[class*=\"DropZone\"]{background:transparent !important;box-shadow:none !important;}" +
  // 3) Hover / selected section: a thin solid blue border, nothing else.
  "[class*=\"DraggableComponent--hover\"] [class*=\"DraggableComponent-overlay\"]," +
  "[class*=\"DraggableComponent--isSelected\"] [class*=\"DraggableComponent-overlay\"]{" +
  "outline:2px solid rgba(76,139,245,0.9) !important;outline-offset:-2px !important;background:transparent !important;box-shadow:none !important;}" +
  // 4) Puck's dashed inline-text-field hint clutters the canvas — StudioProseEdit
  //    draws its own clean solid box + toolbar on tap, so drop the dashed outline.
  "[class*=\"InlineTextField\"]{outline:none !important;}";

export function googleFontsUrl(fonts?: string[]): string | null {
  const list = (fonts || []).filter(Boolean);
  if (!list.length) return null;
  const fam = list
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@300;400;500;600;700;800;900`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${fam}&display=swap`;
}

// Google Fonts organised by style — the picker shows each name in its own
// typeface, grouped under these headings, and is searchable across all of them.
export const FONT_GROUPS: { category: string; fonts: string[] }[] = [
  {
    category: "Sans-serif",
    fonts: [
      "Inter", "Roboto", "Open Sans", "Montserrat", "Poppins", "Lato", "Raleway",
      "Nunito", "Nunito Sans", "Work Sans", "DM Sans", "Manrope", "Sora",
      "Space Grotesk", "Source Sans 3", "PT Sans", "Noto Sans", "Bricolage Grotesque",
      "Archivo", "Archivo Narrow", "Barlow", "Barlow Condensed", "Kanit", "Prompt",
      "Rubik", "Karla", "Mulish", "Hind", "Heebo", "Assistant", "Josefin Sans",
      "Quicksand", "Comfortaa", "Fredoka", "Baloo 2", "Chakra Petch", "Exo 2",
      "Signika", "Cabin", "Catamaran", "Dosis", "Overpass", "Red Hat Display",
      "IBM Plex Sans", "Fira Sans", "Titillium Web", "Questrial", "Jost", "Outfit",
      "Figtree", "Plus Jakarta Sans", "Onest", "Geist", "Schibsted Grotesk",
      "Instrument Sans", "Hanken Grotesk", "Albert Sans", "Be Vietnam Pro",
      "Epilogue", "Syne", "Alegreya Sans", "Sen", "Urbanist", "Lexend",
      "Readex Pro", "Gabarito", "Wix Madefor Text", "Familjen Grotesk", "Anek Latin",
    ],
  },
  {
    category: "Serif",
    fonts: [
      "Playfair Display", "Merriweather", "Lora", "Fraunces", "Cormorant Garamond",
      "Cormorant", "EB Garamond", "Libre Baskerville", "Crimson Text", "Crimson Pro",
      "Spectral", "Bitter", "Source Serif 4", "PT Serif", "Noto Serif",
      "DM Serif Display", "IBM Plex Serif", "Zilla Slab", "Arvo", "Rokkitt",
      "Slabo 27px", "Domine", "Frank Ruhl Libre", "Vollkorn", "Alegreya",
      "Newsreader", "Literata", "Petrona", "Marcellus", "Cinzel", "Cardo",
      "Gilda Display", "Prata", "Italiana", "Bodoni Moda", "Old Standard TT",
      "Tinos", "Neuton", "Bree Serif",
    ],
  },
  {
    category: "Display",
    fonts: [
      "Oswald", "Bebas Neue", "Anton", "Teko", "Rajdhani", "Archivo Black",
      "Rubik Mono One", "Orbitron", "Michroma", "Audiowide", "Righteous", "Bungee",
      "Monoton", "Abril Fatface", "Alfa Slab One", "Yeseva One", "Fjalla One",
      "Passion One", "Titan One", "Bangers", "Concert One", "Paytone One",
      "Unbounded", "League Spartan", "League Gothic", "Big Shoulders Display",
      "Staatliches", "Chewy", "Grandstander",
    ],
  },
  {
    category: "Handwriting",
    fonts: [
      "Lobster", "Lobster Two", "Pacifico", "Dancing Script", "Great Vibes",
      "Satisfy", "Sacramento", "Caveat", "Shadows Into Light", "Permanent Marker",
      "Amatic SC", "Kalam", "Patrick Hand", "Indie Flower", "Gloria Hallelujah",
      "Gochi Hand", "Handlee", "Coming Soon", "Reenie Beanie", "Yellowtail",
      "Cookie", "Allura", "Tangerine", "Pinyon Script", "Homemade Apple",
      "Kaushan Script", "Courgette",
    ],
  },
  {
    category: "Monospace",
    fonts: ["Space Mono", "Source Code Pro", "IBM Plex Mono", "JetBrains Mono", "Fira Code"],
  },
];

// Flat list for searching + validation.
export const GOOGLE_FONTS = FONT_GROUPS.flatMap((g) => g.fonts);
export const POPULAR_FONTS = GOOGLE_FONTS.slice(0, 16);

// Google Fonts stylesheet URLs (chunked to keep each URL reasonable) that load
// the given families at weight 400 for the PICKER PREVIEW (editor only).
export function fontPreviewUrls(fonts: string[]): string[] {
  const urls: string[] = [];
  for (let i = 0; i < fonts.length; i += 40) {
    const fam = fonts
      .slice(i, i + 40)
      .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`)
      .join("&");
    urls.push(`https://fonts.googleapis.com/css2?${fam}&display=swap`);
  }
  return urls;
}

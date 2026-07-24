import type { Config } from "@puckeditor/core";
import type { ReactNode } from "react";
import { stylesToCss, googleFontsUrl, EDIT_CANVAS_CSS, type ElementStyles } from "./elementStyles";
import ScrollFx from "./ScrollFx";
import { faqBlockConfig } from "./faqBlock";
import { productsBlockConfig } from "./productsBlock";
import { testimonialsBlockConfig } from "./testimonialsBlock";
import { galleryBlockConfig } from "./galleryBlock";
import { statsBlockConfig } from "./statsBlock";
import { teamBlockConfig } from "./teamBlock";
import { ctaBlockConfig } from "./ctaBlock";
import { featureGridBlockConfig } from "./featureGridBlock";
import { pricingBlockConfig } from "./pricingBlock";
import { richTextBlockConfig } from "./richTextBlock";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PlanCards from "@/components/PlanCards";
import CoverageChecker from "@/components/CoverageChecker";
import SpeedTest from "@/components/SpeedTest";
import Faq from "@/components/Faq";
import Testimonials from "@/components/Testimonials";
import Referral from "@/components/Referral";
import SignupForm from "@/components/SignupForm";
import HeroBackground from "@/components/HeroBackground";
import TrustMarquee from "@/components/TrustMarquee";
import Reveal from "@/components/Reveal";
import { Prose } from "@/lib/Prose";
import {
  features as defaultFeatures,
  steps as defaultSteps,
  stats as defaultStats,
  company as defaultCompany,
} from "@/lib/content";
import {
  Bolt,
  Infinity as InfinityIcon,
  Shield,
  Pin,
  Arrow,
  Check,
  Wifi,
  Phone,
  Mail,
  Whatsapp,
} from "@/components/Icons";

// ─────────────────────────────────────────────────────────────────────────────
// ZOOM INTERNET — MULTI-PAGE Puck config.
//
// This is the zoom-internet copy of the sg-acaps `makeConfig` pattern. There is
// ONE config: its `components` map holds a Puck block for EVERY distinct section
// across the 5 pages (/, /about, /plans, /contact, /coverage). Each route's seed
// doc (lib/puck/seed.ts) picks the blocks it needs, in order.
//
// Every block wraps the site's REAL bespoke component OR reproduces the page's
// inline-JSX section verbatim (same markup + classNames), feeding Puck field
// values through the exact `ov:`/data-rtr-field override keys the component or
// page already uses — so the Puck-rendered pages are pixel-identical to the
// hand-coded ones. The design stays 100% custom.
//
// Gating mirrors sg-acaps: admin ungated; a client can only edit fields their
// caps allow (text / contact). `photos` is carried in the cap type for parity
// but nothing gates on it (this site has no editable image fields). Layout is
// locked for non-admins (sections can't be added/removed/moved).
//
// INTERACTIVE TOOLS: CoverageChecker, SpeedTest, PlanCards, Testimonials,
// Referral, Faq and SignupForm are all "use client" components that do any
// fetching client-side (in event handlers), so they render fine inside Puck's
// client <Render>. They are wrapped as PASSTHROUGH blocks — their editable text
// still flows through the `overrides` map they already read; their behaviour is
// never converted into static Puck fields. Nav + Footer live in app/layout.tsx
// (site chrome) so they are NOT Puck blocks.
// ─────────────────────────────────────────────────────────────────────────────

export type EditorAccess = {
  isAdmin?: boolean;
  // Retiar's per-client cap switchboard. Zoom has no editable image fields, so
  // `photos` is carried for parity but nothing gates on it; `contact` gates
  // phone/email/address/whatsapp.
  caps?: {
    text?: boolean;
    photos?: boolean;
    contact?: boolean;
    theme?: boolean;
    products?: boolean;
    sections?: boolean;
    layout?: boolean;
  };
};

const featureIconMap = {
  bolt: Bolt,
  infinity: InfinityIcon,
  shield: Shield,
  pin: Pin,
} as const;

export function makeConfig({ isAdmin = false, caps = {} }: EditorAccess = {}): Config {
  const canText = isAdmin || !!caps.text;
  const canContact = isAdmin || !!caps.contact;
  const canPhotos = isAdmin || !!caps.photos;
  const canSections = isAdmin || !!caps.sections;
  const canLayout = isAdmin || !!caps.layout;
  // Layout lock for non-admins: sections can't be added, removed, or moved.
    // drag:false everywhere — sections aren't draggable on the CANVAS; reorder is
  // done in the Layers panel instead. Admins keep insert/delete/duplicate.
  const locked = isAdmin
    ? { drag: false }
    : {
        insert: canSections,
        delete: canSections,
        duplicate: canSections,
        drag: canLayout,
      };
  // Prose fields are edited with Puck's own reliable inline text editor (the same
  // one the plain text fields use). On the page they render formatted via <Prose>
  // → <RichText>; in the Studio a floating B/I/Link toolbar (StudioProseEdit) adds
  // markdown to the selection. The value is a plain markdown string throughout.
  const proseFieldDef = { type: "textarea" as const, label: "Text (**bold**, *italic*, [links](url))" };

  const config = {
    components: {
      // ── FAQ (standalone, add/remove anywhere) ────────────────────────────
      FAQ: faqBlockConfig({ locked, canText }),
      Products: productsBlockConfig({ locked, canText }),
      RtrTestimonials: testimonialsBlockConfig({ locked, canText }),
      RtrStats: statsBlockConfig({ locked, canText }),
      RtrFeatures: featureGridBlockConfig({ locked, canText }),
      RtrPricing: pricingBlockConfig({ locked, canText }),
      RtrCta: ctaBlockConfig({ locked, canText }),
      RtrText: richTextBlockConfig({ locked, canText }),
      RtrGallery: galleryBlockConfig({ locked, canPhotos }),
      RtrTeam: teamBlockConfig({ locked, canText, canPhotos }),
      // ══════════════════════════════════════════════════════════════════════
      // HOME (/)
      // ══════════════════════════════════════════════════════════════════════

      // ── Hero (home) ───────────────────────────────────────────────────────
      // Inline hero JSX from app/page.tsx reproduced verbatim: living background
      // (HeroBackground, client), headline/sub/CTAs/badges, floating glass stat
      // cards (HeroVisual) and the TrustMarquee. All copy rides ov: keys.
      HeroHome: {
        label: "Hero (home)",
        fields: {
          headlineLead: { type: "text", label: "Headline lead" },
          headlineAccent: { type: "text", label: "Headline accent" },
          sub: proseFieldDef,
          ctaPrimary: { type: "text", label: "CTA primary" },
          ctaSecondary: { type: "text", label: "CTA secondary" },
          badge1: { type: "text", label: "Badge 1" },
          badge2: { type: "text", label: "Badge 2" },
          badge3: { type: "text", label: "Badge 3" },
          cardLiveLabel: { type: "text", label: "Card: live label" },
          cardUnlimitedTitle: { type: "text", label: "Card: unlimited title" },
          cardUnlimitedSub: { type: "text", label: "Card: unlimited sub" },
          cardConnected: { type: "text", label: "Card: connected" },
        },
        defaultProps: {
          headlineLead: "Where Speed Meets",
          headlineAccent: "Reliability.",
          sub: "High-speed wireless internet engineered for homes and businesses.",
          ctaPrimary: "Get connected",
          ctaSecondary: "View coverage",
          badge1: "Unlimited data",
          badge2: "Zero contracts",
          badge3: "Reliable connectivity",
          cardLiveLabel: "Live download",
          cardUnlimitedTitle: "Unlimited data",
          cardUnlimitedSub: "No caps, ever",
          cardConnected: "Connected",
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: {
            headlineLead: !canText,
            headlineAccent: !canText,
            sub: !canText,
            ctaPrimary: !canText,
            ctaSecondary: !canText,
            badge1: !canText,
            badge2: !canText,
            badge3: !canText,
            cardLiveLabel: !canText,
            cardUnlimitedTitle: !canText,
            cardUnlimitedSub: !canText,
            cardConnected: !canText,
          },
        }),
        render: ({
          headlineLead,
          headlineAccent,
          sub,
          ctaPrimary,
          ctaSecondary,
          badge1,
          badge2,
          badge3,
          cardLiveLabel,
          cardUnlimitedTitle,
          cardUnlimitedSub,
          cardConnected,
        }) => {
          const badges = [
            { key: "hero.badge_1", txt: badge1 },
            { key: "hero.badge_2", txt: badge2 },
            { key: "hero.badge_3", txt: badge3 },
          ];
          return (
            <section className="relative overflow-hidden pt-[72px]">
              <HeroBackground />

              <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center min-h-[80vh]">
                <div>
                  <Reveal delay={80}>
                    <h1 className="display not-italic font-bold text-[2.7rem] sm:text-[3.6rem] lg:text-[4.2rem] text-[var(--color-heading)]">
                      <span data-rtr-field="ov:hero.headline_lead">{headlineLead}</span>{" "}
                      <span className="text-blue-grad" data-rtr-field="ov:hero.headline_accent">{headlineAccent}</span>
                    </h1>
                  </Reveal>
                  <Reveal delay={150}>
                    <p className="mt-6 max-w-xl text-lg text-[var(--color-slate)] leading-relaxed" data-rtr-field="ov:hero.sub">
                      <Prose value={sub} />
                    </p>
                  </Reveal>
                  <Reveal delay={220}>
                    <div className="flex flex-wrap gap-3 mt-8">
                      <Link href="/contact" className="btn btn-primary btn-flow">
                        <span data-rtr-field="ov:hero.cta_primary">{ctaPrimary}</span> <Arrow className="w-4 h-4" />
                      </Link>
                      <Link href="/coverage" className="btn btn-ghost">
                        <span data-rtr-field="ov:hero.cta_secondary">{ctaSecondary}</span>
                      </Link>
                    </div>
                  </Reveal>
                  <Reveal delay={300}>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 text-sm text-[var(--color-slate)]">
                      {badges.map((b) => (
                        <span key={b.key} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[var(--color-sky)] text-[var(--color-zoom)] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <span data-rtr-field={`ov:${b.key}`}>{b.txt}</span>
                        </span>
                      ))}
                    </div>
                  </Reveal>
                </div>

                <Reveal delay={200} className="mt-6 lg:mt-0">
                  <div className="relative w-full max-w-[460px] mx-auto h-[460px]">
                    <div className="absolute inset-8 bg-gradient-to-br from-[var(--color-cyan)]/25 via-[var(--color-zoom)]/20 to-transparent blur-3xl rounded-full" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="wifi-ring w-[44%] h-[44%]"
                          style={{ animationDelay: `${i * 1.46}s` }}
                        />
                      ))}
                      <div className="wifi-medallion relative w-24 h-24 rounded-[1.6rem] flex items-center justify-center">
                        <Wifi className="w-12 h-12 text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.95)]" />
                      </div>
                    </div>

                    <div className="glass-card absolute top-2 -left-2 float-slow rounded-2xl p-5 w-[200px]">
                      <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider" data-rtr-field="ov:hero.card_live_label">{cardLiveLabel}</div>
                      <div className="display text-4xl text-blue-grad mt-1">100<span className="text-lg text-[var(--color-slate)] ml-1">Mbps</span></div>
                      <div className="mt-3 h-2 rounded-full bg-[var(--color-cloud)] overflow-hidden">
                        <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-zoom)]" />
                      </div>
                    </div>

                    <div className="glass-card absolute bottom-4 right-0 float-slow rounded-2xl px-5 py-4" style={{ animationDelay: "1.5s" }}>
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-[#16a34a]/15 text-[#16a34a] flex items-center justify-center">
                          <InfinityIcon className="w-5 h-5" />
                        </span>
                        <div>
                          <div className="font-semibold text-[var(--color-heading)] text-sm" data-rtr-field="ov:hero.card_unlimited_title">{cardUnlimitedTitle}</div>
                          <div className="text-xs text-[var(--color-muted)]" data-rtr-field="ov:hero.card_unlimited_sub">{cardUnlimitedSub}</div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card absolute top-6 right-2 float-slow rounded-full pl-2 pr-4 py-2 flex items-center gap-2" style={{ animationDelay: "0.8s" }}>
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-zoom-bright)] to-[var(--color-zoom-deep)] flex items-center justify-center">
                        <Wifi className="w-3.5 h-3.5 text-white" />
                      </span>
                      <span className="text-xs font-semibold text-[var(--color-heading)]" data-rtr-field="ov:hero.card_connected">{cardConnected}</span>
                    </div>
                  </div>
                </Reveal>
              </div>

              <TrustMarquee />
            </section>
          );
        },
      },

      // ── Plans section (home) ──────────────────────────────────────────────
      // Heading copy + the sync <PlanCards> (Links only, no local state). Card
      // text rides ov:plan.* keys inside PlanCards.
      PlansSection: {
        label: "Plans (home)",
        fields: {
          eyebrow: { type: "text" },
          heading: { type: "text" },
          intro: proseFieldDef,
        },
        defaultProps: {
          eyebrow: "Plans & pricing",
          heading: "Simple plans. No surprises.",
          intro:
            "Every plan is unlimited and contract-free. Pick the speed that fits your home or business.",
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: { eyebrow: !canText, heading: !canText, intro: !canText },
        }),
        render: ({ eyebrow, heading, intro }) => (
          <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
              <div className="text-center max-w-2xl mx-auto">
                <Reveal><span className="eyebrow" data-rtr-field="ov:plans.eyebrow">{eyebrow}</span></Reveal>
                <Reveal delay={80}>
                  <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:plans.heading">
                    {heading}
                  </h2>
                </Reveal>
                <Reveal delay={140}>
                  <p className="text-[var(--color-slate)] mt-4" data-rtr-field="ov:plans.intro">
                    <Prose value={intro} />
                  </p>
                </Reveal>
              </div>
              <div className="mt-12">
                <PlanCards />
              </div>
            </div>
          </section>
        ),
      },

      // ── How it works (home) ───────────────────────────────────────────────
      StepsSection: {
        label: "How it works (home)",
        fields: {
          eyebrow: { type: "text" },
          heading: { type: "text" },
          items: {
            type: "array",
            label: "Steps",
            getItemSummary: (item: { title?: string }, i) =>
              item?.title || `Step ${(i ?? 0) + 1}`,
            arrayFields: {
              n: { type: "text", label: "Number" },
              title: { type: "text", label: "Title" },
              text: { type: "textarea", label: "Text" },
            },
          },
        },
        defaultProps: {
          eyebrow: "How it works",
          heading: "From sign-up to streaming in four easy steps.",
          items: defaultSteps.map((s) => ({ n: s.n, title: s.title, text: s.text })),
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: { eyebrow: !canText, heading: !canText, items: !canText },
        }),
        render: ({ eyebrow, heading, items }) => (
          <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)] overflow-hidden relative">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24">
              <div className="max-w-2xl">
                <Reveal><span className="eyebrow" data-rtr-field="ov:steps.eyebrow">{eyebrow}</span></Reveal>
                <Reveal delay={80}>
                  <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:steps.heading">
                    {heading}
                  </h2>
                </Reveal>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
                {(items ?? []).map(
                  (s: { n?: string; title?: string; text?: string }, i: number) => (
                    <Reveal key={s.n ?? i} delay={i * 90}>
                      <div className="relative">
                        <div className="display text-5xl text-[var(--color-zoom)]/20 font-bold">{s.n}</div>
                        <h3 className="display text-xl text-[var(--color-heading)] mt-2" data-rtr-field={`ov:step.${s.n}.title`}>{s.title}</h3>
                        <p className="text-[var(--color-slate)] text-sm mt-2 leading-relaxed" data-rtr-field={`ov:step.${s.n}.text`}>{s.text}</p>
                        {i < (items ?? []).length - 1 && (
                          <div className="hidden lg:block absolute top-6 -right-3 text-[var(--color-zoom)]/40">
                            <Arrow className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </Reveal>
                  ),
                )}
              </div>
            </div>
          </section>
        ),
      },

      // ── Coverage + Speed test (home) ──────────────────────────────────────
      // Heading copy + the two interactive tools rendered UNCHANGED (passthrough).
      // CoverageChecker + SpeedTest are "use client" and fetch client-side only.
      TryTools: {
        label: "Coverage + speed test (home)",
        fields: {
          eyebrow: { type: "text" },
          heading: { type: "text" },
        },
        defaultProps: {
          eyebrow: "Try it now",
          heading: "Check coverage & test your speed",
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: { eyebrow: !canText, heading: !canText },
        }),
        render: ({ eyebrow, heading }) => (
          <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Reveal><span className="eyebrow" data-rtr-field="ov:try.eyebrow">{eyebrow}</span></Reveal>
              <Reveal delay={80}>
                <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:try.heading">
                  {heading}
                </h2>
              </Reveal>
            </div>
            <div className="grid lg:grid-cols-2 gap-6 items-start">
              <Reveal><CoverageChecker /></Reveal>
              <Reveal delay={100}><SpeedTest /></Reveal>
            </div>
          </section>
        ),
      },

      // ── Features / Why Zoom (home) ────────────────────────────────────────
      Features: {
        label: "Features (home)",
        fields: {
          eyebrow: { type: "text" },
          heading: { type: "text" },
          items: {
            type: "array",
            label: "Features",
            getItemSummary: (item: { title?: string }, i) =>
              item?.title || `Feature ${(i ?? 0) + 1}`,
            arrayFields: {
              icon: { type: "text", label: "Icon (bolt/infinity/shield/pin)" },
              title: { type: "text", label: "Title" },
              text: { type: "textarea", label: "Text" },
            },
          },
        },
        defaultProps: {
          eyebrow: "Why Zoom",
          heading: "Built for how Jamaica actually uses the internet.",
          items: defaultFeatures.map((f) => ({ icon: f.icon, title: f.title, text: f.text })),
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: { eyebrow: !canText, heading: !canText, items: !canText },
        }),
        render: ({ eyebrow, heading, items }) => (
          <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
            <div className="max-w-2xl">
              <Reveal><span className="eyebrow" data-rtr-field="ov:features.eyebrow">{eyebrow}</span></Reveal>
              <Reveal delay={80}>
                <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:features.heading">
                  {heading}
                </h2>
              </Reveal>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              {(items ?? []).map(
                (f: { icon?: string; title?: string; text?: string }, i: number) => {
                  const Icon = featureIconMap[(f.icon ?? "bolt") as keyof typeof featureIconMap] ?? Bolt;
                  return (
                    <Reveal key={i} delay={i * 80}>
                      <div className="card card-hover h-full p-7">
                        <span className="w-12 h-12 rounded-xl bg-[var(--color-sky)] text-[var(--color-zoom)] flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </span>
                        <h3 className="display text-xl text-[var(--color-heading)] mt-5" data-rtr-field={`ov:feature.${f.icon}.title`}>{f.title}</h3>
                        <p className="text-[var(--color-slate)] text-sm mt-2 leading-relaxed" data-rtr-field={`ov:feature.${f.icon}.text`}>{f.text}</p>
                      </div>
                    </Reveal>
                  );
                },
              )}
            </div>
          </section>
        ),
      },

      // ── Testimonials (home) ───────────────────────────────────────────────
      // Heading copy + the interactive <Testimonials> deck (passthrough).
      TestimonialsSection: {
        label: "Testimonials (home)",
        fields: {
          eyebrow: { type: "text" },
          heading: { type: "text" },
        },
        defaultProps: {
          eyebrow: "Loved across Mobay",
          heading: "What our customers say",
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: { eyebrow: !canText, heading: !canText },
        }),
        render: ({ eyebrow, heading }) => (
          <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <Reveal><span className="eyebrow" data-rtr-field="ov:testi.eyebrow">{eyebrow}</span></Reveal>
                <Reveal delay={80}>
                  <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:testi.heading">
                    {heading}
                  </h2>
                </Reveal>
              </div>
              <Testimonials />
            </div>
          </section>
        ),
      },

      // ── Referral (home) ───────────────────────────────────────────────────
      // The interactive <Referral> card rendered UNCHANGED (passthrough). Its
      // copy rides ov:referral.* keys through the overrides it already reads.
      ReferralSection: {
        label: "Referral (home)",
        fields: {},
        defaultProps: {},
        permissions: locked,
        render: () => (
          <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
            <Reveal><Referral /></Reveal>
          </section>
        ),
      },

      // ── FAQ (home) ────────────────────────────────────────────────────────
      // Heading copy + the interactive <Faq> accordion (passthrough).
      FaqSection: {
        label: "FAQ (home)",
        fields: {
          eyebrow: { type: "text" },
          heading: { type: "text" },
        },
        defaultProps: {
          eyebrow: "Good to know",
          heading: "Frequently asked questions",
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: { eyebrow: !canText, heading: !canText },
        }),
        render: ({ eyebrow, heading }) => (
          <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Reveal><span className="eyebrow" data-rtr-field="ov:faq.eyebrow">{eyebrow}</span></Reveal>
              <Reveal delay={80}>
                <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:faq.heading">
                  {heading}
                </h2>
              </Reveal>
            </div>
            <Reveal><Faq /></Reveal>
          </section>
        ),
      },

      // ── CTA band (home) ───────────────────────────────────────────────────
      // Gradient CTA. Phone is CONTACT-gated; the rest is text.
      CtaBand: {
        label: "CTA band (home)",
        fields: {
          heading: { type: "text" },
          text: proseFieldDef,
          button: { type: "text", label: "Button label" },
          callLabel: { type: "text", label: "Call label" },
          phone: { type: "text", label: "Phone" },
        },
        defaultProps: {
          heading: "Ready to zoom?",
          text: "Join your neighbours across Montego Bay enjoying fast, unlimited internet. Get connected today.",
          button: "Get connected",
          callLabel: "Call",
          phone: defaultCompany.phone,
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: {
            heading: !canText,
            text: !canText,
            button: !canText,
            callLabel: !canText,
            phone: !canContact,
          },
        }),
        render: ({ heading, text, button, callLabel, phone }) => {
          const phoneHref = `+${phone.replace(/[^0-9]/g, "")}`;
          return (
            <section className="px-5 sm:px-8 pb-24">
              <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-br from-[var(--color-zoom-bright)] via-[var(--color-zoom)] to-[var(--color-zoom-deep)] text-white p-10 sm:p-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-20" />
                <div className="relative">
                  <Wifi className="w-12 h-12 mx-auto mb-5 text-white/80" />
                  <h2 className="display text-3xl sm:text-[2.8rem]" data-rtr-field="ov:cta.heading">{heading}</h2>
                  <p className="text-white/85 mt-4 max-w-xl mx-auto text-lg" data-rtr-field="ov:cta.text">
                    <Prose value={text} />
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center mt-8">
                    <Link href="/contact" className="btn btn-white">
                      <span data-rtr-field="ov:cta.button">{button}</span> <Arrow className="w-4 h-4" />
                    </Link>
                    <a href={`tel:${phoneHref}`} className="btn !bg-white/15 !text-white border border-white/30 hover:!bg-white/25">
                      <span data-rtr-field="ov:cta.call_label">{callLabel}</span> <span data-rtr-field="phone">{phone}</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          );
        },
      },

      // ══════════════════════════════════════════════════════════════════════
      // SHARED — PageHeader (dark hero band atop about / plans / contact /
      // coverage). One block, `variant` picks the ov: heading keys per page.
      // The title is a lead + accent span pair.
      // ══════════════════════════════════════════════════════════════════════
      PageHeaderBlock: {
        label: "Page header",
        fields: {
          variant: {
            type: "select",
            label: "Page keys",
            options: [
              { label: "About", value: "about" },
              { label: "Plans", value: "plans_page" },
              { label: "Contact", value: "contact" },
              { label: "Coverage", value: "coverage_page" },
            ],
          },
          eyebrow: { type: "text" },
          titleLead: { type: "text", label: "Title lead" },
          titleAccent: { type: "text", label: "Title accent" },
          sub: proseFieldDef,
        },
        defaultProps: {
          variant: "about",
          eyebrow: "About Zoom",
          titleLead: "Connecting western Jamaica,",
          titleAccent: "one home at a time.",
          sub: defaultCompany.blurb,
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: {
            variant: true,
            eyebrow: !canText,
            titleLead: !canText,
            titleAccent: !canText,
            sub: !canText,
          },
        }),
        render: ({ variant, eyebrow, titleLead, titleAccent, sub }) => {
          // Each page's sub uses a slightly different key: about → page_sub;
          // plans/contact/coverage → sub. Match the hand-coded pages exactly.
          const subKey = variant === "about" ? "page_sub" : "sub";
          return (
            <PageHeader
              eyebrow={eyebrow}
              eyebrowField={`ov:${variant}.eyebrow`}
              title={
                <>
                  <span data-rtr-field={`ov:${variant}.title_lead`}>{titleLead}</span>{" "}
                  <span className="text-blue-grad" data-rtr-field={`ov:${variant}.title_accent`}>{titleAccent}</span>
                </>
              }
              sub={sub}
              subField={`ov:${variant}.${subKey}`}
            />
          );
        },
      },

      // ══════════════════════════════════════════════════════════════════════
      // ABOUT (/about)
      // ══════════════════════════════════════════════════════════════════════

      // ── Story + mission (about) ───────────────────────────────────────────
      AboutStory: {
        label: "Story + mission (about)",
        fields: {
          storyEyebrow: { type: "text", label: "Story eyebrow" },
          storyHeading: { type: "text", label: "Story heading" },
          about: { ...proseFieldDef, label: "About (p1)" },
          p2: { ...proseFieldDef, label: "Paragraph 2" },
          p3: { type: "text", label: "Paragraph 3" },
          storyCta: { type: "text", label: "Story CTA" },
          missionTitle: { type: "text", label: "Mission title" },
          missionText: { ...proseFieldDef, label: "Mission text" },
          stats: {
            type: "array",
            label: "Stats",
            getItemSummary: (item: { value?: string }, i) =>
              item?.value || `Stat ${(i ?? 0) + 1}`,
            arrayFields: {
              icon: { type: "text", label: "Icon key" },
              value: { type: "text", label: "Value" },
              label: { type: "text", label: "Label" },
            },
          },
        },
        defaultProps: {
          storyEyebrow: "Our story",
          storyHeading: "Born out of frustration with slow, unreliable internet.",
          about: defaultCompany.blurb,
          p2: "So we built Zoom — a fixed-wireless network powered by enterprise-grade Cambium radios that beam high-speed internet straight to your door. The result is a connection that's fast to install, genuinely unlimited, and backed by a team right here on the island.",
          p3: "Because internet just got a whole lot better.",
          storyCta: "Talk to our team",
          missionTitle: "Our mission",
          missionText:
            "To deliver fast, reliable and affordable internet to every community we serve — with the honest, personal service Jamaicans deserve.",
          stats: defaultStats.map((s) => ({ icon: s.icon, value: s.value, label: s.label })),
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: {
            storyEyebrow: !canText,
            storyHeading: !canText,
            about: !canText,
            p2: !canText,
            p3: !canText,
            storyCta: !canText,
            missionTitle: !canText,
            missionText: !canText,
            stats: !canText,
          },
        }),
        render: ({
          storyEyebrow,
          storyHeading,
          about,
          p2,
          p3,
          storyCta,
          missionTitle,
          missionText,
          stats,
        }) => (
          <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <Reveal><span className="eyebrow" data-rtr-field="ov:about.story_eyebrow">{storyEyebrow}</span></Reveal>
              <Reveal delay={80}>
                <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:about.story_heading">
                  {storyHeading}
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <div className="text-[var(--color-slate)] mt-5 space-y-4 leading-relaxed">
                  <p data-rtr-field="about"><Prose value={about} /></p>
                  <p data-rtr-field="ov:about.story_p2"><Prose value={p2} /></p>
                  <p className="text-[var(--color-heading)] font-medium" data-rtr-field="ov:about.story_p3">{p3}</p>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <Link href="/contact" className="btn btn-primary mt-7">
                  <span data-rtr-field="ov:about.story_cta">{storyCta}</span> <Arrow className="w-4 h-4" />
                </Link>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <div className="p-10 rounded-[1.4rem] bg-gradient-to-br from-[var(--color-zoom-bright)] via-[var(--color-zoom)] to-[var(--color-zoom-deep)] text-white relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 grid-bg opacity-15" />
                <Wifi className="relative w-12 h-12 text-white" />
                <h3 className="relative display text-2xl mt-5" data-rtr-field="ov:about.mission_title">{missionTitle}</h3>
                <p className="relative text-white/75 mt-3 leading-relaxed" data-rtr-field="ov:about.mission_text">
                  <Prose value={missionText} />
                </p>
                <div className="relative grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                  {(stats ?? []).map(
                    (s: { icon?: string; value?: string; label?: string }, i: number) => (
                      <div key={s.icon ?? i}>
                        <div className="display text-3xl text-[var(--color-cyan)]" data-rtr-field={`ov:about.stat.${s.icon}.value`}>{s.value}</div>
                        <div className="text-xs text-white/60 mt-1" data-rtr-field={`ov:about.stat.${s.icon}.label`}>{s.label}</div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </Reveal>
          </section>
        ),
      },

      // ── Values grid (about) ───────────────────────────────────────────────
      AboutValues: {
        label: "Values grid (about)",
        fields: {
          eyebrow: { type: "text" },
          heading: { type: "text" },
          items: {
            type: "array",
            label: "Values",
            getItemSummary: (item: { title?: string }, i) =>
              item?.title || `Value ${(i ?? 0) + 1}`,
            arrayFields: {
              id: { type: "text", label: "Id (icon key)" },
              title: { type: "text", label: "Title" },
              text: { type: "textarea", label: "Text" },
            },
          },
        },
        defaultProps: {
          eyebrow: "What we stand for",
          heading: "The Zoom difference",
          items: [
            { id: "speed", title: "Speed you can feel", text: "We invest in modern Wave 2 wireless gear so your connection stays fast at peak time, not just on a speed test." },
            { id: "honest", title: "Honest service", text: "No lock-in contracts, no mystery fees, no throttling. What we quote is what you pay — every month." },
            { id: "local", title: "Proudly local", text: "We live and work in Montego Bay. Supporting our neighbours with internet they can rely on is personal for us." },
          ],
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: { eyebrow: !canText, heading: !canText, items: !canText },
        }),
        render: ({ eyebrow, heading, items }) => {
          const iconFor: Record<string, typeof Bolt> = { speed: Bolt, honest: Shield, local: Pin };
          return (
            <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
              <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="eyebrow" data-rtr-field="ov:about.values_eyebrow">{eyebrow}</span>
                  <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:about.values_heading">
                    {heading}
                  </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {(items ?? []).map(
                    (v: { id?: string; title?: string; text?: string }, i: number) => {
                      const Icon = iconFor[v.id ?? ""] ?? Bolt;
                      return (
                        <Reveal key={i} delay={i * 90}>
                          <div className="card card-hover h-full p-8">
                            <span className="w-12 h-12 rounded-xl bg-[var(--color-sky)] text-[var(--color-zoom)] flex items-center justify-center">
                              <Icon className="w-6 h-6" />
                            </span>
                            <h3 className="display text-xl text-[var(--color-heading)] mt-5" data-rtr-field={`ov:about.value.${v.id}.title`}>{v.title}</h3>
                            <p className="text-[var(--color-slate)] text-sm mt-2 leading-relaxed" data-rtr-field={`ov:about.value.${v.id}.text`}>{v.text}</p>
                          </div>
                        </Reveal>
                      );
                    },
                  )}
                </div>
              </div>
            </section>
          );
        },
      },

      // ── CTA (about) ───────────────────────────────────────────────────────
      AboutCta: {
        label: "CTA (about)",
        fields: {
          heading: { type: "text" },
          text: { type: "textarea", label: "Lead-in text" },
          phone: { type: "text", label: "Phone" },
          ctaCoverage: { type: "text", label: "Coverage CTA" },
          ctaPlans: { type: "text", label: "Plans CTA" },
        },
        defaultProps: {
          heading: "Ready to experience the difference?",
          text: "Check your coverage and get connected today, or give our Mobay team a call at",
          phone: defaultCompany.phone,
          ctaCoverage: "Check coverage",
          ctaPlans: "View plans",
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: {
            heading: !canText,
            text: !canText,
            phone: !canContact,
            ctaCoverage: !canText,
            ctaPlans: !canText,
          },
        }),
        render: ({ heading, text, phone, ctaCoverage, ctaPlans }) => {
          const phoneHref = `+${phone.replace(/[^0-9]/g, "")}`;
          return (
            <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 text-center">
              <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)]" data-rtr-field="ov:about.cta_heading">
                {heading}
              </h2>
              <p className="text-[var(--color-slate)] mt-4 max-w-xl mx-auto">
                <span data-rtr-field="ov:about.cta_text">{text}</span>{" "}
                <a href={`tel:${phoneHref}`} className="text-[var(--color-zoom)] font-semibold"><span data-rtr-field="phone">{phone}</span></a>.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-7">
                <Link href="/coverage" className="btn btn-primary"><span data-rtr-field="ov:about.cta_coverage">{ctaCoverage}</span> <Arrow className="w-4 h-4" /></Link>
                <Link href="/plans" className="btn btn-ghost"><span data-rtr-field="ov:about.cta_plans">{ctaPlans}</span></Link>
              </div>
            </section>
          );
        },
      },

      // ══════════════════════════════════════════════════════════════════════
      // PLANS (/plans)
      // ══════════════════════════════════════════════════════════════════════

      // ── Plan cards (plans) ────────────────────────────────────────────────
      // The sync <PlanCards> in its own section wrapper (passthrough; card text
      // rides ov:plan.* keys inside the component).
      PlansCardsSection: {
        label: "Plan cards (plans)",
        fields: {},
        defaultProps: {},
        permissions: locked,
        render: () => (
          <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
            <PlanCards />
          </section>
        ),
      },

      // ── What's included (plans) ───────────────────────────────────────────
      PlansIncluded: {
        label: "What's included (plans)",
        fields: {
          eyebrow: { type: "text" },
          heading: { type: "text" },
          text: proseFieldDef,
          cta: { type: "text", label: "CTA label" },
          items: {
            type: "array",
            label: "Included items",
            getItemSummary: (item: { label?: string }, i) =>
              item?.label || `Item ${(i ?? 0) + 1}`,
            arrayFields: {
              label: { type: "text", label: "Label" },
            },
          },
        },
        defaultProps: {
          eyebrow: "Every plan includes",
          heading: "More than just megabits.",
          text: "Whichever plan you choose, you get the full Zoom experience — no hidden fees, no throttling, and people who actually pick up the phone.",
          cta: "Get connected",
          items: [
            { label: "Truly unlimited data — no caps" },
            { label: "No fixed-term contract" },
            { label: "Free standard installation" },
            { label: "Dual-band Wi-Fi router included" },
            { label: "Local Montego Bay support" },
            { label: "Quick few-day install" },
          ],
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: {
            eyebrow: !canText,
            heading: !canText,
            text: !canText,
            cta: !canText,
            items: !canText,
          },
        }),
        render: ({ eyebrow, heading, text, cta, items }) => (
          <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Reveal><span className="eyebrow" data-rtr-field="ov:plans_page.included_eyebrow">{eyebrow}</span></Reveal>
                <Reveal delay={80}>
                  <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:plans_page.included_heading">
                    {heading}
                  </h2>
                </Reveal>
                <Reveal delay={140}>
                  <p className="text-[var(--color-slate)] mt-4 max-w-lg" data-rtr-field="ov:plans_page.included_text">
                    <Prose value={text} />
                  </p>
                </Reveal>
                <Reveal delay={200}>
                  <Link href="/contact" className="btn btn-primary mt-7">
                    <span data-rtr-field="ov:plans_page.included_cta">{cta}</span> <Arrow className="w-4 h-4" />
                  </Link>
                </Reveal>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {(items ?? []).map(
                  (f: { label?: string }, i: number) => (
                    <Reveal key={i} delay={i * 70}>
                      <div className="card p-5 flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-[var(--color-sky)] text-[var(--color-zoom)] flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4" />
                        </span>
                        <span className="text-[var(--color-heading)] font-medium text-sm pt-1" data-rtr-field={`ov:plans_page.included.${i}`}>{f.label}</span>
                      </div>
                    </Reveal>
                  ),
                )}
              </div>
            </div>
          </section>
        ),
      },

      // ── FAQ (plans) ───────────────────────────────────────────────────────
      // Heading copy + the interactive <Faq> accordion + a phone footer line.
      PlansFaq: {
        label: "FAQ (plans)",
        fields: {
          eyebrow: { type: "text" },
          heading: { type: "text" },
          footer: { type: "text", label: "Footer text" },
          phone: { type: "text", label: "Phone" },
        },
        defaultProps: {
          eyebrow: "Questions",
          heading: "Before you sign up",
          footer: "Still have questions? Call us at",
          phone: defaultCompany.phone,
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: {
            eyebrow: !canText,
            heading: !canText,
            footer: !canText,
            phone: !canContact,
          },
        }),
        render: ({ eyebrow, heading, footer, phone }) => {
          const phoneHref = `+${phone.replace(/[^0-9]/g, "")}`;
          return (
            <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="eyebrow" data-rtr-field="ov:plans_page.faq_eyebrow">{eyebrow}</span>
                <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:plans_page.faq_heading">
                  {heading}
                </h2>
              </div>
              <Faq />
              <p className="text-center text-[var(--color-slate)] mt-10">
                <span data-rtr-field="ov:plans_page.faq_footer">{footer}</span>{" "}
                <a href={`tel:${phoneHref}`} className="text-[var(--color-zoom)] font-semibold"><span data-rtr-field="phone">{phone}</span></a>.
              </p>
            </section>
          );
        },
      },

      // ══════════════════════════════════════════════════════════════════════
      // CONTACT (/contact)
      // ══════════════════════════════════════════════════════════════════════

      // ── Contact rail + signup form (contact) ──────────────────────────────
      // Left: contact details (phone/email/whatsapp/address are CONTACT-gated;
      // labels + support hours are text). Right: the interactive <SignupForm>
      // rendered UNCHANGED (passthrough — posts to /api/lead client-side).
      ContactSection: {
        label: "Contact rail + form (contact)",
        fields: {
          labelCall: { type: "text", label: "Call label" },
          phone: { type: "text", label: "Phone" },
          labelWhatsapp: { type: "text", label: "WhatsApp label" },
          valueWhatsapp: { type: "text", label: "WhatsApp value" },
          whatsapp: { type: "text", label: "WhatsApp number" },
          labelEmail: { type: "text", label: "Email label" },
          email: { type: "text", label: "Email" },
          labelLocation: { type: "text", label: "Location label" },
          location: { type: "text", label: "Location" },
          hoursTitle: { type: "text", label: "Hours title" },
          hoursWeekdayLabel: { type: "text", label: "Weekday label" },
          hoursWeekdayTime: { type: "text", label: "Weekday time" },
          hoursSatLabel: { type: "text", label: "Saturday label" },
          hoursSatTime: { type: "text", label: "Saturday time" },
          hoursSunLabel: { type: "text", label: "Sunday label" },
          hoursSunTime: { type: "text", label: "Sunday time" },
        },
        defaultProps: {
          labelCall: "Call us",
          phone: defaultCompany.phone,
          labelWhatsapp: "WhatsApp",
          valueWhatsapp: "Chat with us instantly",
          whatsapp: defaultCompany.whatsapp,
          labelEmail: "Email",
          email: defaultCompany.email,
          labelLocation: "Location",
          location: defaultCompany.location,
          hoursTitle: "Support hours",
          hoursWeekdayLabel: "Mon – Fri",
          hoursWeekdayTime: "8:00am – 7:00pm",
          hoursSatLabel: "Saturday",
          hoursSatTime: "9:00am – 5:00pm",
          hoursSunLabel: "Sunday",
          hoursSunTime: "Emergency only",
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: {
            labelCall: !canText,
            phone: !canContact,
            labelWhatsapp: !canText,
            valueWhatsapp: !canText,
            whatsapp: !canContact,
            labelEmail: !canText,
            email: !canContact,
            labelLocation: !canText,
            location: !canContact,
            hoursTitle: !canText,
            hoursWeekdayLabel: !canText,
            hoursWeekdayTime: !canText,
            hoursSatLabel: !canText,
            hoursSatTime: !canText,
            hoursSunLabel: !canText,
            hoursSunTime: !canText,
          },
        }),
        render: ({
          labelCall,
          phone,
          labelWhatsapp,
          valueWhatsapp,
          whatsapp,
          labelEmail,
          email,
          labelLocation,
          location,
          hoursTitle,
          hoursWeekdayLabel,
          hoursWeekdayTime,
          hoursSatLabel,
          hoursSatTime,
          hoursSunLabel,
          hoursSunTime,
        }) => {
          const phoneHref = `+${phone.replace(/[^0-9]/g, "")}`;
          const waText = encodeURIComponent("Hi Zoom Internet! I'd like to get connected.");
          const cards = [
            {
              icon: <Phone className="w-5 h-5" />,
              label: <span data-rtr-field="ov:contact.label_call">{labelCall}</span>,
              value: <span data-rtr-field="phone">{phone}</span>,
              href: `tel:${phoneHref}`,
            },
            {
              icon: <Whatsapp className="w-5 h-5" />,
              label: <span data-rtr-field="ov:contact.label_whatsapp">{labelWhatsapp}</span>,
              value: <span data-rtr-field="ov:contact.value_whatsapp">{valueWhatsapp}</span>,
              href: `https://wa.me/${whatsapp}?text=${waText}`,
              accent: "#25D366",
              external: true,
            },
            {
              icon: <Mail className="w-5 h-5" />,
              label: <span data-rtr-field="ov:contact.label_email">{labelEmail}</span>,
              value: <span data-rtr-field="email">{email}</span>,
              href: `mailto:${email}`,
            },
            {
              icon: <Pin className="w-5 h-5" />,
              label: <span data-rtr-field="ov:contact.label_location">{labelLocation}</span>,
              value: <span data-rtr-field="address">{location}</span>,
            },
          ];
          return (
            <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
              <Reveal>
                <div className="space-y-4">
                  {cards.map((c, i) => {
                    const inner = (
                      <div className="card card-hover p-5 flex items-center gap-4">
                        <span
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                          style={{ background: c.accent || "var(--color-zoom)" }}
                        >
                          {c.icon}
                        </span>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{c.label}</div>
                          <div className="font-semibold text-[var(--color-heading)]">{c.value}</div>
                        </div>
                      </div>
                    );
                    if (!c.href) return <div key={i}>{inner}</div>;
                    return (
                      <a
                        key={i}
                        href={c.href}
                        {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="block"
                      >
                        {inner}
                      </a>
                    );
                  })}

                  <div className="card p-6">
                    <h3 className="display text-lg text-[var(--color-heading)]" data-rtr-field="ov:contact.hours_title">{hoursTitle}</h3>
                    <ul className="mt-3 text-sm text-[var(--color-slate)] space-y-1.5">
                      <li className="flex justify-between"><span data-rtr-field="ov:contact.hours_weekday_label">{hoursWeekdayLabel}</span><span data-rtr-field="ov:contact.hours_weekday_time">{hoursWeekdayTime}</span></li>
                      <li className="flex justify-between"><span data-rtr-field="ov:contact.hours_sat_label">{hoursSatLabel}</span><span data-rtr-field="ov:contact.hours_sat_time">{hoursSatTime}</span></li>
                      <li className="flex justify-between"><span data-rtr-field="ov:contact.hours_sun_label">{hoursSunLabel}</span><span data-rtr-field="ov:contact.hours_sun_time">{hoursSunTime}</span></li>
                    </ul>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <SignupForm type="signup" />
              </Reveal>
            </section>
          );
        },
      },

      // ══════════════════════════════════════════════════════════════════════
      // COVERAGE (/coverage)
      // ══════════════════════════════════════════════════════════════════════

      // ── Coverage checker + speed test (coverage) ──────────────────────────
      // The two interactive tools rendered UNCHANGED (passthrough).
      CoverageTools: {
        label: "Coverage + speed test (coverage)",
        fields: {},
        defaultProps: {},
        permissions: locked,
        render: () => (
          <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-2 gap-6 items-start">
            <Reveal><CoverageChecker /></Reveal>
            <Reveal delay={100}><SpeedTest /></Reveal>
          </section>
        ),
      },

      // ── Served areas (coverage) ───────────────────────────────────────────
      CoverageAreas: {
        label: "Served areas (coverage)",
        fields: {
          eyebrow: { type: "text" },
          heading: { type: "text" },
          text: proseFieldDef,
          items: {
            type: "array",
            label: "Areas",
            getItemSummary: (item: { label?: string }, i) =>
              item?.label || `Area ${(i ?? 0) + 1}`,
            arrayFields: {
              label: { type: "text", label: "Area" },
            },
          },
        },
        defaultProps: {
          eyebrow: "Service areas",
          heading: "Communities we currently serve",
          text: "Expanding all the time. Don't see your area? Join the waitlist above and we'll let you know the moment we reach you.",
          items: [
            "Montego Bay", "Mobay", "Rose Hall", "Ironshore", "Coral Gardens", "Bogue",
            "Catherine Hall", "Flankers", "Granville", "Reading", "Anchovy", "Adelphi",
            "Cambridge", "Falmouth", "Hopewell", "Lucea", "Montego Hills", "Albion",
            "Fairview", "Westgate",
          ].map((a) => ({ label: a })),
        },
        permissions: locked,
        resolveData: ({ props }) => ({
          props,
          readOnly: {
            eyebrow: !canText,
            heading: !canText,
            text: !canText,
            items: !canText,
          },
        }),
        render: ({ eyebrow, heading, text, items }) => (
          <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="eyebrow" data-rtr-field="ov:coverage_page.areas_eyebrow">{eyebrow}</span>
                <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:coverage_page.areas_heading">
                  {heading}
                </h2>
                <p className="text-[var(--color-slate)] mt-4" data-rtr-field="ov:coverage_page.areas_text">
                  <Prose value={text} />
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {(items ?? []).map(
                  (a: { label?: string }, i: number) => (
                    <Reveal key={i} delay={i * 30}>
                      <span className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--color-heading)]">
                        <Pin className="w-4 h-4 text-[var(--color-zoom)]" /> <span data-rtr-field={`ov:coverage_page.area.${i}`}>{a.label}</span>
                      </span>
                    </Reveal>
                  ),
                )}
              </div>
            </div>
          </section>
        ),
      },
    },
  } as Config;

  // ── Per-element design layer ──────────────────────────────────────────────
  // Emit the design CSS + Google-font links from root props. Because both the
  // Studio canvas and the public site render through this config's root.render,
  // styles set in the inspector apply live AND publish with zero per-component
  // work — they target each slot's data-rtr-field attribute.
  config.root = {
    render: ({
      children,
      elementStyles,
      fonts,
    }: {
      children?: ReactNode;
      elementStyles?: ElementStyles;
      fonts?: string[];
    }) => {
      const css = EDIT_CANVAS_CSS + stylesToCss(elementStyles);
      const href = googleFontsUrl(fonts);
      return (
        <>
          {href ? <link rel="stylesheet" href={href} /> : null}
          {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
          <ScrollFx />
          {children}
        </>
      );
    },
  } as Config["root"];


  // ── Inline (on-canvas) editing ────────────────────────────────────────────
  // Turn on Puck's contentEditable for every plain text/textarea field so the
  // client can click the words ON THE PAGE and type — no side panel needed.
  // Skipped (NO_INLINE): fields whose value is used in a NON-child string
  // context and would break if Puck handed them a React node instead of a
  // string — contact values that feed href="tel:"/"mailto:"/wa.me and get
  // `.replace()`d (phone/email/whatsapp), and lookup/key fields used to index
  // an icon map or build a data-rtr-field key (icon/id/n). Those stay
  // panel-edited. Rich-text fields are `type:"custom"` and untouched here. Only
  // affects the Studio editor — the public <Render> path ignores contentEditable.
  const NO_INLINE = new Set(["phone", "email", "whatsapp", "icon", "id", "n"]);
  const inlineOn = (f: { type?: string; contentEditable?: boolean }, name: string) => {
    if ((f.type === "text" || f.type === "textarea") && !NO_INLINE.has(name)) {
      f.contentEditable = true;
    }
  };
  for (const comp of Object.values(config.components) as Array<{
    fields?: Record<string, { type?: string; contentEditable?: boolean; arrayFields?: Record<string, { type?: string; contentEditable?: boolean }> }>;
  }>) {
    for (const [name, f] of Object.entries(comp.fields ?? {})) {
      inlineOn(f, name);
      if (f.type === "array" && f.arrayFields) {
        for (const [sub, sf] of Object.entries(f.arrayFields)) inlineOn(sf, sub);
      }
    }
  }

  return config;
}

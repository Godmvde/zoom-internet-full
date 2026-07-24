import type { Data } from "@puckeditor/core";
import type { PuckMap } from "@/lib/puck/store";
import {
  features as defaultFeatures,
  steps as defaultSteps,
  stats as defaultStats,
  company as defaultCompany,
} from "@/lib/content";

// ─────────────────────────────────────────────────────────────────────────────
// ZOOM INTERNET — MULTI-PAGE Puck seed.
//
// A PuckMap = Record<route, Data>. Each route's `content` array is that page's
// sections in order, seeded with the page's CURRENT default text/values (from
// lib/content.ts + the pages' literal strings). Rendered through the shared
// makeConfig blocks, each route reproduces the live page pixel-for-pixel.
//
// Nav + Footer live in app/layout.tsx (site chrome, not per-page) so they are
// NOT in any route's doc. This is BOTH the studio's starting point AND the
// content-migration seed the admin publishes to make the DB the source of truth.
// Keep in sync with lib/content.ts defaults + lib/puck/config.tsx defaultProps.
// ─────────────────────────────────────────────────────────────────────────────

const home: Data = {
  root: {},
  content: [
    {
      type: "HeroHome",
      props: {
        id: "HeroHome-home",
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
    },
    {
      type: "PlansSection",
      props: {
        id: "PlansSection-home",
        eyebrow: "Plans & pricing",
        heading: "Simple plans. No surprises.",
        intro:
          "Every plan is unlimited and contract-free. Pick the speed that fits your home or business.",
      },
    },
    {
      type: "StepsSection",
      props: {
        id: "StepsSection-home",
        eyebrow: "How it works",
        heading: "From sign-up to streaming in four easy steps.",
        items: defaultSteps.map((s) => ({ n: s.n, title: s.title, text: s.text })),
      },
    },
    {
      type: "TryTools",
      props: {
        id: "TryTools-home",
        eyebrow: "Try it now",
        heading: "Check coverage & test your speed",
      },
    },
    {
      type: "Features",
      props: {
        id: "Features-home",
        eyebrow: "Why Zoom",
        heading: "Built for how Jamaica actually uses the internet.",
        items: defaultFeatures.map((f) => ({ icon: f.icon, title: f.title, text: f.text })),
      },
    },
    {
      type: "TestimonialsSection",
      props: {
        id: "TestimonialsSection-home",
        eyebrow: "Loved across Mobay",
        heading: "What our customers say",
      },
    },
    {
      type: "ReferralSection",
      props: { id: "ReferralSection-home" },
    },
    {
      type: "FaqSection",
      props: {
        id: "FaqSection-home",
        eyebrow: "Good to know",
        heading: "Frequently asked questions",
      },
    },
    {
      type: "CtaBand",
      props: {
        id: "CtaBand-home",
        heading: "Ready to zoom?",
        text: "Join your neighbours across Montego Bay enjoying fast, unlimited internet. Get connected today.",
        button: "Get connected",
        callLabel: "Call",
        phone: defaultCompany.phone,
      },
    },
  ],
  zones: {},
};

const about: Data = {
  root: {},
  content: [
    {
      type: "PageHeaderBlock",
      props: {
        id: "PageHeaderBlock-about",
        variant: "about",
        eyebrow: "About Zoom",
        titleLead: "Connecting western Jamaica,",
        titleAccent: "one home at a time.",
        sub: defaultCompany.blurb,
      },
    },
    {
      type: "AboutStory",
      props: {
        id: "AboutStory-about",
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
    },
    {
      type: "AboutValues",
      props: {
        id: "AboutValues-about",
        eyebrow: "What we stand for",
        heading: "The Zoom difference",
        items: [
          { id: "speed", title: "Speed you can feel", text: "We invest in modern Wave 2 wireless gear so your connection stays fast at peak time, not just on a speed test." },
          { id: "honest", title: "Honest service", text: "No lock-in contracts, no mystery fees, no throttling. What we quote is what you pay — every month." },
          { id: "local", title: "Proudly local", text: "We live and work in Montego Bay. Supporting our neighbours with internet they can rely on is personal for us." },
        ],
      },
    },
    {
      type: "AboutCta",
      props: {
        id: "AboutCta-about",
        heading: "Ready to experience the difference?",
        text: "Check your coverage and get connected today, or give our Mobay team a call at",
        phone: defaultCompany.phone,
        ctaCoverage: "Check coverage",
        ctaPlans: "View plans",
      },
    },
  ],
  zones: {},
};

const plansPage: Data = {
  root: {},
  content: [
    {
      type: "PageHeaderBlock",
      props: {
        id: "PageHeaderBlock-plans",
        variant: "plans_page",
        eyebrow: "Plans & Pricing",
        titleLead: "Pick your speed.",
        titleAccent: "Keep it unlimited.",
        sub: "Straightforward monthly plans with no contracts and no data caps. Prices shown in JMD per month, plus GCT.",
      },
    },
    {
      type: "PlansCardsSection",
      props: { id: "PlansCardsSection-plans" },
    },
    {
      type: "PlansIncluded",
      props: {
        id: "PlansIncluded-plans",
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
    },
    {
      type: "PlansFaq",
      props: {
        id: "PlansFaq-plans",
        eyebrow: "Questions",
        heading: "Before you sign up",
        footer: "Still have questions? Call us at",
        phone: defaultCompany.phone,
      },
    },
  ],
  zones: {},
};

const contact: Data = {
  root: {},
  content: [
    {
      type: "PageHeaderBlock",
      props: {
        id: "PageHeaderBlock-contact",
        variant: "contact",
        eyebrow: "Get connected",
        titleLead: "Let's get you",
        titleAccent: "online.",
        sub: "Fill out the form and our local team will reach out to schedule your installation — usually within a few days. Prefer to talk? Reach us any of the ways below.",
      },
    },
    {
      type: "ContactSection",
      props: {
        id: "ContactSection-contact",
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
    },
  ],
  zones: {},
};

const coverage: Data = {
  root: {},
  content: [
    {
      type: "PageHeaderBlock",
      props: {
        id: "PageHeaderBlock-coverage",
        variant: "coverage_page",
        eyebrow: "Coverage",
        titleLead: "Find out if you're in the",
        titleAccent: "Zoom zone.",
        sub: "We serve Montego Bay and a growing list of communities across western Jamaica. Check your area below — and test your current speed while you're here.",
      },
    },
    {
      type: "CoverageTools",
      props: { id: "CoverageTools-coverage" },
    },
    {
      type: "CoverageAreas",
      props: {
        id: "CoverageAreas-coverage",
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
    },
  ],
  zones: {},
};

export const seed: PuckMap = {
  "/": home,
  "/about": about,
  "/plans": plansPage,
  "/contact": contact,
  "/coverage": coverage,
};

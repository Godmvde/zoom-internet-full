import Link from "next/link";
import { Render, type Data } from "@puckeditor/core";
import Reveal from "@/components/Reveal";
import PlanCards from "@/components/PlanCards";
import CoverageChecker from "@/components/CoverageChecker";
import SpeedTest from "@/components/SpeedTest";
import Faq from "@/components/Faq";
import Testimonials from "@/components/Testimonials";
import Referral from "@/components/Referral";
import HeroBackground from "@/components/HeroBackground";
import TrustMarquee from "@/components/TrustMarquee";
import { company, features, steps } from "@/lib/content";
import { getSite } from "@/lib/live";
import { makeT } from "@/lib/t";
import { makeConfig } from "@/lib/puck/config";
import { Bolt, Infinity as InfinityIcon, Shield, Pin, Arrow, Check, Wifi } from "@/components/Icons";

const iconMap = { bolt: Bolt, infinity: InfinityIcon, shield: Shield, pin: Pin } as const;

type Tr = (key: string, fallback: string) => string;

const heroBadges = [
  { key: "hero.badge.0", txt: "Unlimited data" },
  { key: "hero.badge.1", txt: "Zero contracts" },
  { key: "hero.badge.2", txt: "Reliable connectivity" },
];

export default async function Home() {
  const { company: co, overrides, puck } = await getSite();
  const t = makeT(overrides);

  // If an admin has published a Puck layout for this route, render it.
  const doc = puck?.["/"];
  if (doc) {
    return <Render config={makeConfig({ isAdmin: true })} data={doc as unknown as Data} />;
  }

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden pt-[72px]">
        {/* Living background: parallax Earth, glow, edge-blur & star particles */}
        <HeroBackground />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center min-h-[80vh]">
          <div>
            <Reveal delay={80}>
              <h1 className="display not-italic font-bold text-[2.7rem] sm:text-[3.6rem] lg:text-[4.2rem] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]">
                <span data-rtr-field="ov:hero.headline_lead">{t("hero.headline_lead", "Where Speed Meets")}</span>{" "}
                <span className="text-blue-grad" data-rtr-field="ov:hero.headline_accent">{t("hero.headline_accent", "Reliability.")}</span>
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-xl text-lg text-white/80 leading-relaxed" data-rtr-field="ov:hero.sub">
                {t("hero.sub", "High-speed wireless internet engineered for homes and businesses.")}
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/contact" className="btn btn-primary btn-flow">
                  <span data-rtr-field="ov:hero.cta_primary">{t("hero.cta_primary", "Get connected")}</span> <Arrow className="w-4 h-4" />
                </Link>
                <Link href="/coverage" className="btn !bg-white/10 !text-white border border-white/25 backdrop-blur-md hover:!bg-white/20">
                  <span data-rtr-field="ov:hero.cta_secondary">{t("hero.cta_secondary", "View coverage")}</span>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 text-sm text-white/90">
                {heroBadges.map((b) => (
                  <span key={b.key} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span data-rtr-field={`ov:${b.key}`}>{t(b.key, b.txt)}</span>
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Floating glass stat cards over the background */}
          <Reveal delay={200} className="mt-6 lg:mt-0">
            <HeroVisual t={t} />
          </Reveal>
        </div>

        {/* Trusted Across Jamaica — sliding marquee */}
        <TrustMarquee overrides={overrides} />
      </section>

      {/* ===== PLANS ===== */}
      <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto">
            <Reveal><span className="eyebrow" data-rtr-field="ov:plans.eyebrow">{t("plans.eyebrow", "Plans & pricing")}</span></Reveal>
            <Reveal delay={80}>
              <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:plans.heading">
                {t("plans.heading", "Simple plans. No surprises.")}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-[var(--color-slate)] mt-4" data-rtr-field="ov:plans.intro">
                {t("plans.intro", "Every plan is unlimited and contract-free. Pick the speed that fits your home or business.")}
              </p>
            </Reveal>
          </div>
          <div className="mt-12">
            <PlanCards />
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-[var(--color-navy)] text-white overflow-hidden relative">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24">
          <div className="max-w-2xl">
            <Reveal><span className="eyebrow !text-[var(--color-cyan)]" data-rtr-field="ov:steps.eyebrow">{t("steps.eyebrow", "How it works")}</span></Reveal>
            <Reveal delay={80}>
              <h2 className="display text-3xl sm:text-[2.6rem] mt-3" data-rtr-field="ov:steps.heading">
                {t("steps.heading", "From sign-up to streaming in four easy steps.")}
              </h2>
            </Reveal>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="relative">
                  <div className="display text-5xl text-white/15 font-bold">{s.n}</div>
                  <h3 className="display text-xl mt-2" data-rtr-field={`ov:step.${s.n}.title`}>{t(`step.${s.n}.title`, s.title)}</h3>
                  <p className="text-white/65 text-sm mt-2 leading-relaxed" data-rtr-field={`ov:step.${s.n}.text`}>{t(`step.${s.n}.text`, s.text)}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 -right-3 text-[var(--color-cyan)]/40">
                      <Arrow className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COVERAGE + SPEED TEST ===== */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Reveal><span className="eyebrow" data-rtr-field="ov:try.eyebrow">{t("try.eyebrow", "Try it now")}</span></Reveal>
          <Reveal delay={80}>
            <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:try.heading">
              {t("try.heading", "Check coverage & test your speed")}
            </h2>
          </Reveal>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <Reveal><CoverageChecker overrides={overrides} /></Reveal>
          <Reveal delay={100}><SpeedTest overrides={overrides} /></Reveal>
        </div>
      </section>

      {/* ===== FEATURES (Why Us) ===== */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="max-w-2xl">
          <Reveal><span className="eyebrow" data-rtr-field="ov:features.eyebrow">{t("features.eyebrow", "Why Zoom")}</span></Reveal>
          <Reveal delay={80}>
            <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:features.heading">
              {t("features.heading", "Built for how Jamaica actually uses the internet.")}
            </h2>
          </Reveal>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {features.map((f, i) => {
            const Icon = iconMap[f.icon as keyof typeof iconMap];
            return (
              <Reveal key={f.title} delay={i * 80}>
                <div className="card card-hover h-full p-7">
                  <span className="w-12 h-12 rounded-xl bg-[var(--color-sky)] text-[var(--color-zoom)] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </span>
                  <h3 className="display text-xl text-[var(--color-heading)] mt-5" data-rtr-field={`ov:feature.${f.icon}.title`}>{t(`feature.${f.icon}.title`, f.title)}</h3>
                  <p className="text-[var(--color-slate)] text-sm mt-2 leading-relaxed" data-rtr-field={`ov:feature.${f.icon}.text`}>{t(`feature.${f.icon}.text`, f.text)}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Reveal><span className="eyebrow" data-rtr-field="ov:testi.eyebrow">{t("testi.eyebrow", "Loved across Mobay")}</span></Reveal>
            <Reveal delay={80}>
              <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:testi.heading">
                {t("testi.heading", "What our customers say")}
              </h2>
            </Reveal>
          </div>
          <Testimonials overrides={overrides} />
        </div>
      </section>

      {/* ===== REFERRAL ===== */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <Reveal><Referral overrides={overrides} /></Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Reveal><span className="eyebrow" data-rtr-field="ov:faq.eyebrow">{t("faq.eyebrow", "Good to know")}</span></Reveal>
          <Reveal delay={80}>
            <h2 className="display text-3xl sm:text-[2.6rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:faq.heading">
              {t("faq.heading", "Frequently asked questions")}
            </h2>
          </Reveal>
        </div>
        <Reveal><Faq overrides={overrides} /></Reveal>
      </section>

      {/* ===== CTA ===== */}
      <section className="px-5 sm:px-8 pb-24">
        <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-br from-[var(--color-zoom-bright)] via-[var(--color-zoom)] to-[var(--color-zoom-deep)] text-white p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative">
            <Wifi className="w-12 h-12 mx-auto mb-5 text-white/80" />
            <h2 className="display text-3xl sm:text-[2.8rem]" data-rtr-field="ov:cta.heading">{t("cta.heading", "Ready to zoom?")}</h2>
            <p className="text-white/85 mt-4 max-w-xl mx-auto text-lg" data-rtr-field="ov:cta.text">
              {t("cta.text", "Join your neighbours across Montego Bay enjoying fast, unlimited internet. Get connected today.")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <Link href="/contact" className="btn btn-white">
                <span data-rtr-field="ov:cta.button">{t("cta.button", "Get connected")}</span> <Arrow className="w-4 h-4" />
              </Link>
              <a href={`tel:${co.phoneHref}`} className="btn !bg-white/15 !text-white border border-white/30 hover:!bg-white/25">
                <span data-rtr-field="ov:cta.call_label">{t("cta.call_label", "Call")}</span> <span data-rtr-field="phone">{co.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroVisual({ t }: { t: Tr }) {
  return (
    <div className="relative w-full max-w-[460px] mx-auto h-[460px]">
      {/* glow */}
      <div className="absolute inset-8 bg-gradient-to-br from-[var(--color-cyan)]/25 via-[var(--color-zoom)]/20 to-transparent blur-3xl rounded-full" />

      {/* glowing wifi beacon — medallion with radiating signal rings (wifi.png) */}
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

      {/* live speed card */}
      <div className="glass-card absolute top-2 -left-2 float-slow rounded-2xl p-5 w-[200px]">
        <div className="text-xs text-white/60 uppercase tracking-wider" data-rtr-field="ov:hero.card_live_label">{t("hero.card_live_label", "Live download")}</div>
        <div className="display text-4xl text-blue-grad mt-1">100<span className="text-lg text-white/70 ml-1">Mbps</span></div>
        <div className="mt-3 h-2 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-zoom)]" />
        </div>
      </div>

      {/* unlimited card */}
      <div className="glass-card absolute bottom-4 right-0 float-slow rounded-2xl px-5 py-4" style={{ animationDelay: "1.5s" }}>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-[#22e07a]/20 text-[#22e07a] flex items-center justify-center">
            <InfinityIcon className="w-5 h-5" />
          </span>
          <div>
            <div className="font-semibold text-white text-sm" data-rtr-field="ov:hero.card_unlimited_title">{t("hero.card_unlimited_title", "Unlimited data")}</div>
            <div className="text-xs text-white/60" data-rtr-field="ov:hero.card_unlimited_sub">{t("hero.card_unlimited_sub", "No caps, ever")}</div>
          </div>
        </div>
      </div>

      {/* connected pill */}
      <div className="glass-card absolute top-6 right-2 float-slow rounded-full pl-2 pr-4 py-2 flex items-center gap-2" style={{ animationDelay: "0.8s" }}>
        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-zoom-bright)] to-[var(--color-zoom-deep)] flex items-center justify-center">
          <Wifi className="w-3.5 h-3.5 text-white" />
        </span>
        <span className="text-xs font-semibold text-white" data-rtr-field="ov:hero.card_connected">{t("hero.card_connected", "Connected")}</span>
      </div>
    </div>
  );
}

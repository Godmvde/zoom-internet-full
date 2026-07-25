import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { stats } from "@/lib/content";
import { getSite } from "@/lib/live";
import { makeT } from "@/lib/t";
import { Render, type Data } from "@puckeditor/core";
import { makeConfig } from "@/lib/puck/config";
export const dynamic = "force-dynamic";
import { Bolt, Shield, Pin, Arrow, Wifi } from "@/components/Icons";

export const metadata: Metadata = {
  title: "About — Zoom Internet",
  description:
    "Zoom Internet is a locally-owned wireless ISP delivering fast, unlimited broadband to homes and businesses across Montego Bay, Jamaica.",
};

const values = [
  { id: "speed", icon: Bolt, title: "Speed you can feel", text: "We invest in modern Wave 2 wireless gear so your connection stays fast at peak time, not just on a speed test." },
  { id: "honest", icon: Shield, title: "Honest service", text: "No lock-in contracts, no mystery fees, no throttling. What we quote is what you pay — every month." },
  { id: "local", icon: Pin, title: "Proudly local", text: "We live and work in Montego Bay. Supporting our neighbours with internet they can rely on is personal for us." },
];

export default async function AboutPage() {
  const { company, overrides, puck } = await getSite();
  const t = makeT(overrides);

  const doc = puck?.["/about"];
  if (doc) {
    return <Render config={makeConfig({ isAdmin: true })} data={doc as unknown as Data} />;
  }

  return (
    <>
      <PageHeader
        eyebrow={t("about.eyebrow", "About Zoom")}
        eyebrowField="ov:about.eyebrow"
        title={<><span data-rtr-field="ov:about.title_lead">{t("about.title_lead", "Connecting western Jamaica,")}</span> <span className="text-blue-grad" data-rtr-field="ov:about.title_accent">{t("about.title_accent", "one home at a time.")}</span></>}
        sub={t("about.page_sub", "Zoom Internet is a locally-owned service provider on a simple mission: give Jamaican homes and businesses internet that's genuinely fast, fairly priced, and properly supported.")}
        subField="ov:about.page_sub"
      />

      {/* Story */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <Reveal><span className="eyebrow" data-rtr-field="ov:about.story_eyebrow">{t("about.story_eyebrow", "Our story")}</span></Reveal>
          <Reveal delay={80}>
            <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:about.story_heading">
              {t("about.story_heading", "Born out of frustration with slow, unreliable internet.")}
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="text-[var(--color-slate)] mt-5 space-y-4 leading-relaxed">
              <p data-rtr-field="about">{company.blurb}</p>
              <p data-rtr-field="ov:about.story_p2">
                {t("about.story_p2", "So we built Zoom — a fixed-wireless network powered by enterprise-grade Cambium radios that beam high-speed internet straight to your door. The result is a connection that's fast to install, genuinely unlimited, and backed by a team right here on the island.")}
              </p>
              <p className="text-[var(--color-heading)] font-medium" data-rtr-field="ov:about.story_p3">
                {t("about.story_p3", "Because internet just got a whole lot better.")}
              </p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <Link href="/contact" className="btn btn-primary mt-7">
              <span data-rtr-field="ov:about.story_cta">{t("about.story_cta", "Talk to our team")}</span> <Arrow className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="p-10 rounded-[1.4rem] bg-gradient-to-br from-[var(--color-zoom-bright)] via-[var(--color-zoom)] to-[var(--color-zoom-deep)] text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 grid-bg opacity-15" />
            <Wifi className="relative w-12 h-12 text-white" />
            <h3 className="relative display text-2xl mt-5" data-rtr-field="ov:about.mission_title">{t("about.mission_title", "Our mission")}</h3>
            <p className="relative text-white/75 mt-3 leading-relaxed" data-rtr-field="ov:about.mission_text">
              {t("about.mission_text", "To deliver fast, reliable and affordable internet to every community we serve — with the honest, personal service Jamaicans deserve.")}
            </p>
            <div className="relative grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="display text-3xl text-[var(--color-cyan)]" data-rtr-field={`ov:about.stat.${s.icon}.value`}>{t(`about.stat.${s.icon}.value`, s.value)}</div>
                  <div className="text-xs text-white/60 mt-1" data-rtr-field={`ov:about.stat.${s.icon}.label`}>{t(`about.stat.${s.icon}.label`, s.label)}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Values */}
      <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow" data-rtr-field="ov:about.values_eyebrow">{t("about.values_eyebrow", "What we stand for")}</span>
            <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:about.values_heading">
              {t("about.values_heading", "The Zoom difference")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 90}>
                <div className="card card-hover h-full p-8">
                  <span className="w-12 h-12 rounded-xl bg-[var(--color-sky)] text-[var(--color-zoom)] flex items-center justify-center">
                    <v.icon className="w-6 h-6" />
                  </span>
                  <h3 className="display text-xl text-[var(--color-heading)] mt-5" data-rtr-field={`ov:about.value.${v.id}.title`}>{t(`about.value.${v.id}.title`, v.title)}</h3>
                  <p className="text-[var(--color-slate)] text-sm mt-2 leading-relaxed" data-rtr-field={`ov:about.value.${v.id}.text`}>{t(`about.value.${v.id}.text`, v.text)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 text-center">
        <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)]" data-rtr-field="ov:about.cta_heading">
          {t("about.cta_heading", "Ready to experience the difference?")}
        </h2>
        <p className="text-[var(--color-slate)] mt-4 max-w-xl mx-auto">
          <span data-rtr-field="ov:about.cta_text">{t("about.cta_text", "Check your coverage and get connected today, or give our Mobay team a call at")}</span>{" "}
          <a href={`tel:${company.phoneHref}`} className="text-[var(--color-zoom)] font-semibold"><span data-rtr-field="phone">{company.phone}</span></a>.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-7">
          <Link href="/coverage" className="btn btn-primary"><span data-rtr-field="ov:about.cta_coverage">{t("about.cta_coverage", "Check coverage")}</span> <Arrow className="w-4 h-4" /></Link>
          <Link href="/plans" className="btn btn-ghost"><span data-rtr-field="ov:about.cta_plans">{t("about.cta_plans", "View plans")}</span></Link>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PlanCards from "@/components/PlanCards";
import Faq from "@/components/Faq";
import Reveal from "@/components/Reveal";
import { Check, Arrow } from "@/components/Icons";
import { getSite } from "@/lib/live";
import { makeT } from "@/lib/t";
import { Render, type Data } from "@puckeditor/core";
import { makeConfig } from "@/lib/puck/config";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plans & Pricing — Zoom Internet",
  description:
    "Unlimited, contract-free wireless internet plans for homes and businesses in Montego Bay. Family 50 Mbps, Work From Home 100 Mbps, and Business 125 Mbps.",
};

const included = [
  "Truly unlimited data — no caps",
  "No fixed-term contract",
  "Free standard installation",
  "Dual-band Wi-Fi router included",
  "Local Montego Bay support",
  "Quick few-day install",
];

export default async function PlansPage() {
  const { company, overrides, puck } = await getSite();
  const t = makeT(overrides);

  const doc = puck?.["/plans"];
  if (doc) {
    return <Render config={makeConfig({ isAdmin: true })} data={doc as unknown as Data} />;
  }

  return (
    <>
      <PageHeader
        eyebrow={t("plans_page.eyebrow", "Plans & Pricing")}
        eyebrowField="ov:plans_page.eyebrow"
        title={<><span data-rtr-field="ov:plans_page.title_lead">{t("plans_page.title_lead", "Pick your speed.")}</span> <span className="text-blue-grad" data-rtr-field="ov:plans_page.title_accent">{t("plans_page.title_accent", "Keep it unlimited.")}</span></>}
        sub={t("plans_page.sub", "Straightforward monthly plans with no contracts and no data caps. Prices shown in JMD per month, plus GCT.")}
        subField="ov:plans_page.sub"
      />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <PlanCards />
      </section>

      {/* What's included */}
      <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Reveal><span className="eyebrow" data-rtr-field="ov:plans_page.included_eyebrow">{t("plans_page.included_eyebrow", "Every plan includes")}</span></Reveal>
            <Reveal delay={80}>
              <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:plans_page.included_heading">
                {t("plans_page.included_heading", "More than just megabits.")}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-[var(--color-slate)] mt-4 max-w-lg" data-rtr-field="ov:plans_page.included_text">
                {t("plans_page.included_text", "Whichever plan you choose, you get the full Zoom experience — no hidden fees, no throttling, and people who actually pick up the phone.")}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Link href="/contact" className="btn btn-primary mt-7">
                <span data-rtr-field="ov:plans_page.included_cta">{t("plans_page.included_cta", "Get connected")}</span> <Arrow className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {included.map((f, i) => (
              <Reveal key={f} delay={i * 70}>
                <div className="card p-5 flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-[var(--color-sky)] text-[var(--color-zoom)] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="text-[var(--color-heading)] font-medium text-sm pt-1" data-rtr-field={`ov:plans_page.included.${i}`}>{t(`plans_page.included.${i}`, f)}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="eyebrow" data-rtr-field="ov:plans_page.faq_eyebrow">{t("plans_page.faq_eyebrow", "Questions")}</span>
          <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:plans_page.faq_heading">
            {t("plans_page.faq_heading", "Before you sign up")}
          </h2>
        </div>
        <Faq overrides={overrides} />
        <p className="text-center text-[var(--color-slate)] mt-10">
          <span data-rtr-field="ov:plans_page.faq_footer">{t("plans_page.faq_footer", "Still have questions? Call us at")}</span>{" "}
          <a href={`tel:${company.phoneHref}`} className="text-[var(--color-zoom)] font-semibold">{company.phone}</a>.
        </p>
      </section>
    </>
  );
}

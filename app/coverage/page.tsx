import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CoverageChecker from "@/components/CoverageChecker";
import SpeedTest from "@/components/SpeedTest";
import Reveal from "@/components/Reveal";
import { coverageAreas } from "@/lib/content";
import { getSite } from "@/lib/live";
import { makeT } from "@/lib/t";
import { Render, type Data } from "@puckeditor/core";
import { makeConfig } from "@/lib/puck/config";
import { Pin } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Coverage — Zoom Internet",
  description:
    "Check if Zoom Internet's fast wireless broadband is available in your area of Montego Bay and western Jamaica.",
};

export default async function CoveragePage() {
  const { overrides, puck } = await getSite();
  const t = makeT(overrides);

  const doc = puck?.["/coverage"];
  if (doc) {
    return <Render config={makeConfig({ isAdmin: true })} data={doc as unknown as Data} />;
  }

  return (
    <>
      <PageHeader
        eyebrow={t("coverage_page.eyebrow", "Coverage")}
        eyebrowField="ov:coverage_page.eyebrow"
        title={<><span data-rtr-field="ov:coverage_page.title_lead">{t("coverage_page.title_lead", "Find out if you're in the")}</span> <span className="text-blue-grad" data-rtr-field="ov:coverage_page.title_accent">{t("coverage_page.title_accent", "Zoom zone.")}</span></>}
        sub={t("coverage_page.sub", "We serve Montego Bay and a growing list of communities across western Jamaica. Check your area below — and test your current speed while you're here.")}
        subField="ov:coverage_page.sub"
      />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-2 gap-6 items-start">
        <Reveal><CoverageChecker overrides={overrides} /></Reveal>
        <Reveal delay={100}><SpeedTest overrides={overrides} /></Reveal>
      </section>

      {/* Served areas */}
      <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow" data-rtr-field="ov:coverage_page.areas_eyebrow">{t("coverage_page.areas_eyebrow", "Service areas")}</span>
            <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3" data-rtr-field="ov:coverage_page.areas_heading">
              {t("coverage_page.areas_heading", "Communities we currently serve")}
            </h2>
            <p className="text-[var(--color-slate)] mt-4" data-rtr-field="ov:coverage_page.areas_text">
              {t("coverage_page.areas_text", "Expanding all the time. Don't see your area? Join the waitlist above and we'll let you know the moment we reach you.")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {coverageAreas.map((a, i) => (
              <Reveal key={a} delay={i * 30}>
                <span className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--color-heading)]">
                  <Pin className="w-4 h-4 text-[var(--color-zoom)]" /> <span data-rtr-field={`ov:coverage_page.area.${i}`}>{t(`coverage_page.area.${i}`, a)}</span>
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

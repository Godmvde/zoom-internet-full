import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CoverageChecker from "@/components/CoverageChecker";
import SpeedTest from "@/components/SpeedTest";
import Reveal from "@/components/Reveal";
import { coverageAreas } from "@/lib/content";
import { Pin } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Coverage — Zoom Internet",
  description:
    "Check if Zoom Internet's fast wireless broadband is available in your area of Montego Bay and western Jamaica.",
};

export default function CoveragePage() {
  return (
    <>
      <PageHeader
        eyebrow="Coverage"
        title={<>Find out if you&apos;re in the <span className="text-blue-grad">Zoom zone.</span></>}
        sub="We serve Montego Bay and a growing list of communities across western Jamaica. Check your area below — and test your current speed while you're here."
      />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-2 gap-6 items-start">
        <Reveal><CoverageChecker /></Reveal>
        <Reveal delay={100}><SpeedTest /></Reveal>
      </section>

      {/* Served areas */}
      <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">Service areas</span>
            <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3">
              Communities we currently serve
            </h2>
            <p className="text-[var(--color-slate)] mt-4">
              Expanding all the time. Don&apos;t see your area? Join the waitlist above and we&apos;ll
              let you know the moment we reach you.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {coverageAreas.map((a, i) => (
              <Reveal key={a} delay={i * 30}>
                <span className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--color-heading)]">
                  <Pin className="w-4 h-4 text-[var(--color-zoom)]" /> {a}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

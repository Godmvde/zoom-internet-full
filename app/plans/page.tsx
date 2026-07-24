import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PlanCards from "@/components/PlanCards";
import Faq from "@/components/Faq";
import Reveal from "@/components/Reveal";
import { Check, Arrow } from "@/components/Icons";
import { company } from "@/lib/content";

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

export default function PlansPage() {
  return (
    <>
      <PageHeader
        eyebrow="Plans & Pricing"
        title={<>Pick your speed. <span className="text-blue-grad">Keep it unlimited.</span></>}
        sub="Straightforward monthly plans with no contracts and no data caps. Prices shown in JMD per month, plus GCT."
      />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <PlanCards />
      </section>

      {/* What's included */}
      <section className="bg-[var(--color-mist)] border-y border-[var(--color-line)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Reveal><span className="eyebrow">Every plan includes</span></Reveal>
            <Reveal delay={80}>
              <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3">
                More than just megabits.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-[var(--color-slate)] mt-4 max-w-lg">
                Whichever plan you choose, you get the full Zoom experience — no hidden fees,
                no throttling, and people who actually pick up the phone.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Link href="/contact" className="btn btn-primary mt-7">
                Get connected <Arrow className="w-4 h-4" />
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
                  <span className="text-[var(--color-heading)] font-medium text-sm pt-1">{f}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="eyebrow">Questions</span>
          <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3">
            Before you sign up
          </h2>
        </div>
        <Faq />
        <p className="text-center text-[var(--color-slate)] mt-10">
          Still have questions? Call us at{" "}
          <a href={`tel:${company.phoneHref}`} className="text-[var(--color-zoom)] font-semibold">{company.phone}</a>.
        </p>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { stats, company } from "@/lib/content";
import { Bolt, Shield, Pin, Arrow, Wifi } from "@/components/Icons";

export const metadata: Metadata = {
  title: "About — Zoom Internet",
  description:
    "Zoom Internet is a locally-owned wireless ISP delivering fast, unlimited broadband to homes and businesses across Montego Bay, Jamaica.",
};

const values = [
  { icon: Bolt, title: "Speed you can feel", text: "We invest in modern Wave 2 wireless gear so your connection stays fast at peak time, not just on a speed test." },
  { icon: Shield, title: "Honest service", text: "No lock-in contracts, no mystery fees, no throttling. What we quote is what you pay — every month." },
  { icon: Pin, title: "Proudly local", text: "We live and work in Montego Bay. Supporting our neighbours with internet they can rely on is personal for us." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Zoom"
        title={<>Connecting western Jamaica, <span className="text-blue-grad">one home at a time.</span></>}
        sub="Zoom Internet is a locally-owned service provider on a simple mission: give Jamaican homes and businesses internet that's genuinely fast, fairly priced, and properly supported."
      />

      {/* Story */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <Reveal><span className="eyebrow">Our story</span></Reveal>
          <Reveal delay={80}>
            <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3">
              Born out of frustration with slow, unreliable internet.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="text-[var(--color-slate)] mt-5 space-y-4 leading-relaxed">
              <p>
                Too many homes and businesses in and around Montego Bay were stuck choosing between
                slow connections, painful data caps, and providers you could never reach when something
                went wrong. We knew it could be better.
              </p>
              <p>
                So we built Zoom — a fixed-wireless network powered by enterprise-grade Cambium radios
                that beam high-speed internet straight to your door. The result is a connection that&apos;s
                fast to install, genuinely unlimited, and backed by a team right here on the island.
              </p>
              <p className="text-[var(--color-heading)] font-medium">
                Because internet just got a whole lot better.
              </p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <Link href="/contact" className="btn btn-primary mt-7">
              Talk to our team <Arrow className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="card p-10 bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <Wifi className="relative w-12 h-12 text-[var(--color-cyan)]" />
            <h3 className="relative display text-2xl mt-5">Our mission</h3>
            <p className="relative text-white/75 mt-3 leading-relaxed">
              To deliver fast, reliable and affordable internet to every community we serve — with the
              honest, personal service Jamaicans deserve.
            </p>
            <div className="relative grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="display text-3xl text-[var(--color-cyan)]">{s.value}</div>
                  <div className="text-xs text-white/60 mt-1">{s.label}</div>
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
            <span className="eyebrow">What we stand for</span>
            <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)] mt-3">
              The Zoom difference
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 90}>
                <div className="card card-hover h-full p-8">
                  <span className="w-12 h-12 rounded-xl bg-[var(--color-sky)] text-[var(--color-zoom)] flex items-center justify-center">
                    <v.icon className="w-6 h-6" />
                  </span>
                  <h3 className="display text-xl text-[var(--color-heading)] mt-5">{v.title}</h3>
                  <p className="text-[var(--color-slate)] text-sm mt-2 leading-relaxed">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 text-center">
        <h2 className="display text-3xl sm:text-[2.4rem] text-[var(--color-heading)]">
          Ready to experience the difference?
        </h2>
        <p className="text-[var(--color-slate)] mt-4 max-w-xl mx-auto">
          Check your coverage and get connected today, or give our Mobay team a call at{" "}
          <a href={`tel:${company.phoneHref}`} className="text-[var(--color-zoom)] font-semibold">{company.phone}</a>.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-7">
          <Link href="/coverage" className="btn btn-primary">Check coverage <Arrow className="w-4 h-4" /></Link>
          <Link href="/plans" className="btn btn-ghost">View plans</Link>
        </div>
      </section>
    </>
  );
}

import Reveal from "./Reveal";
import { Prose } from "@/lib/Prose";

export default function PageHeader({
  eyebrow,
  title,
  sub,
  eyebrowField,
  subField,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  eyebrowField?: string;
  subField?: string;
}) {
  return (
    <section className="relative overflow-hidden pt-[72px] border-b border-[var(--color-line)]">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute -top-32 -right-24 w-[460px] h-[460px] rounded-full bg-gradient-to-br from-[var(--color-cyan)]/20 to-[var(--color-zoom)]/15 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <Reveal><span className="eyebrow" {...(eyebrowField ? { "data-rtr-field": eyebrowField } : {})}>{eyebrow}</span></Reveal>
        <Reveal delay={80}>
          <h1 className="display text-[2.4rem] sm:text-[3.2rem] text-[var(--color-heading)] mt-3 max-w-3xl">
            {title}
          </h1>
        </Reveal>
        {sub && (
          <Reveal delay={140}>
            <p className="text-lg text-[var(--color-slate)] mt-4 max-w-2xl" {...(subField ? { "data-rtr-field": subField } : {})}><Prose value={sub} /></p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

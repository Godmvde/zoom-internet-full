import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SignupForm from "@/components/SignupForm";
import Reveal from "@/components/Reveal";
import { company } from "@/lib/content";
import { Phone, Mail, Pin, Whatsapp } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Contact & Get Connected — Zoom Internet",
  description:
    "Get connected with Zoom Internet or reach our Montego Bay support team. Call, email, or WhatsApp us — we're here to help.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;

  const waText = encodeURIComponent("Hi Zoom Internet! I'd like to get connected.");

  return (
    <>
      <PageHeader
        eyebrow="Get connected"
        title={<>Let&apos;s get you <span className="text-blue-grad">online.</span></>}
        sub="Fill out the form and our local team will reach out to schedule your installation — usually within a few days. Prefer to talk? Reach us any of the ways below."
      />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
        {/* Contact rail */}
        <Reveal>
          <div className="space-y-4">
            <ContactCard
              icon={<Phone className="w-5 h-5" />}
              label="Call us"
              value={company.phone}
              href={`tel:${company.phoneHref}`}
            />
            <ContactCard
              icon={<Whatsapp className="w-5 h-5" />}
              label="WhatsApp"
              value="Chat with us instantly"
              href={`https://wa.me/${company.whatsapp}?text=${waText}`}
              accent="#25D366"
              external
            />
            <ContactCard
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              value={company.email}
              href={`mailto:${company.email}`}
            />
            <ContactCard
              icon={<Pin className="w-5 h-5" />}
              label="Location"
              value={company.location}
            />

            <div className="card p-6 bg-[var(--color-navy)] text-white">
              <h3 className="display text-lg">Support hours</h3>
              <ul className="mt-3 text-sm text-white/75 space-y-1.5">
                <li className="flex justify-between"><span>Mon – Fri</span><span>8:00am – 7:00pm</span></li>
                <li className="flex justify-between"><span>Saturday</span><span>9:00am – 5:00pm</span></li>
                <li className="flex justify-between"><span>Sunday</span><span>Emergency only</span></li>
              </ul>
            </div>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={100}>
          <SignupForm defaultPlan={plan} type="signup" />
        </Reveal>
      </section>
    </>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  accent,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  accent?: string;
  external?: boolean;
}) {
  const inner = (
    <div className="card card-hover p-5 flex items-center gap-4">
      <span
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
        style={{ background: accent || "var(--color-zoom)" }}
      >
        {icon}
      </span>
      <div>
        <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</div>
        <div className="font-semibold text-[var(--color-heading)]">{value}</div>
      </div>
    </div>
  );
  if (!href) return inner;
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block">
      {inner}
    </a>
  );
}

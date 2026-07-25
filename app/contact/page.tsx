import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SignupForm from "@/components/SignupForm";
import Reveal from "@/components/Reveal";
import { getSite } from "@/lib/live";
import { makeT } from "@/lib/t";
import { Render, type Data } from "@puckeditor/core";
import { makeConfig } from "@/lib/puck/config";
export const dynamic = "force-dynamic";
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
  const { company, overrides, puck } = await getSite();
  const t = makeT(overrides);

  const waText = encodeURIComponent("Hi Zoom Internet! I'd like to get connected.");

  const doc = puck?.["/contact"];
  if (doc) {
    return <Render config={makeConfig({ isAdmin: true })} data={doc as unknown as Data} />;
  }

  return (
    <>
      <PageHeader
        eyebrow={t("contact.eyebrow", "Get connected")}
        eyebrowField="ov:contact.eyebrow"
        title={<><span data-rtr-field="ov:contact.title_lead">{t("contact.title_lead", "Let's get you")}</span> <span className="text-blue-grad" data-rtr-field="ov:contact.title_accent">{t("contact.title_accent", "online.")}</span></>}
        sub={t("contact.sub", "Fill out the form and our local team will reach out to schedule your installation — usually within a few days. Prefer to talk? Reach us any of the ways below.")}
        subField="ov:contact.sub"
      />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
        {/* Contact rail */}
        <Reveal>
          <div className="space-y-4">
            <ContactCard
              icon={<Phone className="w-5 h-5" />}
              label={<span data-rtr-field="ov:contact.label_call">{t("contact.label_call", "Call us")}</span>}
              value={<span data-rtr-field="phone">{company.phone}</span>}
              href={`tel:${company.phoneHref}`}
            />
            <ContactCard
              icon={<Whatsapp className="w-5 h-5" />}
              label={<span data-rtr-field="ov:contact.label_whatsapp">{t("contact.label_whatsapp", "WhatsApp")}</span>}
              value={<span data-rtr-field="ov:contact.value_whatsapp">{t("contact.value_whatsapp", "Chat with us instantly")}</span>}
              href={`https://wa.me/${company.whatsapp}?text=${waText}`}
              accent="#25D366"
              external
            />
            <ContactCard
              icon={<Mail className="w-5 h-5" />}
              label={<span data-rtr-field="ov:contact.label_email">{t("contact.label_email", "Email")}</span>}
              value={<span data-rtr-field="email">{company.email}</span>}
              href={`mailto:${company.email}`}
            />
            <ContactCard
              icon={<Pin className="w-5 h-5" />}
              label={<span data-rtr-field="ov:contact.label_location">{t("contact.label_location", "Location")}</span>}
              value={<span data-rtr-field="address">{company.location}</span>}
            />

            <div className="card p-6">
              <h3 className="display text-lg text-[var(--color-heading)]" data-rtr-field="ov:contact.hours_title">{t("contact.hours_title", "Support hours")}</h3>
              <ul className="mt-3 text-sm text-[var(--color-slate)] space-y-1.5">
                <li className="flex justify-between"><span data-rtr-field="ov:contact.hours_weekday_label">{t("contact.hours_weekday_label", "Mon – Fri")}</span><span data-rtr-field="ov:contact.hours_weekday_time">{t("contact.hours_weekday_time", "8:00am – 7:00pm")}</span></li>
                <li className="flex justify-between"><span data-rtr-field="ov:contact.hours_sat_label">{t("contact.hours_sat_label", "Saturday")}</span><span data-rtr-field="ov:contact.hours_sat_time">{t("contact.hours_sat_time", "9:00am – 5:00pm")}</span></li>
                <li className="flex justify-between"><span data-rtr-field="ov:contact.hours_sun_label">{t("contact.hours_sun_label", "Sunday")}</span><span data-rtr-field="ov:contact.hours_sun_time">{t("contact.hours_sun_time", "Emergency only")}</span></li>
              </ul>
            </div>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={100}>
          <SignupForm defaultPlan={plan} type="signup" overrides={overrides} />
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
  label: React.ReactNode;
  value: React.ReactNode;
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

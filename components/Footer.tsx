import Link from "next/link";
import Logo from "./Logo";
import { getSite } from "@/lib/live";
import { makeT } from "@/lib/t";
import { Phone, Mail, Pin } from "./Icons";
import RetiarCredit, { showsCredit } from "./RetiarCredit";

export default async function Footer() {
  const { company, overrides, design } = await getSite();
  const t = makeT(overrides);
  return (
    <footer className="relative bg-[var(--color-navy)] text-white mt-auto overflow-hidden">
      {/* Background picture */}
      <div className="absolute inset-0">
        <img
          src="/img/earth.png"
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-top opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)]/80 via-[var(--color-navy)]/85 to-[var(--color-navy)]/95" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-5 text-white/65 max-w-sm leading-relaxed" data-rtr-field="ov:footer.blurb">
              {t("footer.blurb", company.blurb)}
            </p>
            <div className="mt-6 flex gap-3">
              <Social href={company.socials.instagram} label="Instagram">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.42-.35 1.04-.4 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.4 2.19.22.55.47.94.88 1.35.41.41.8.66 1.35.88.42.16 1.04.35 2.19.4 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.19-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.42.35-1.04.4-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.4-2.19a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.42-.16-1.04-.35-2.19-.4-1.24-.06-1.61-.07-4.76-.07Zm0 2.76a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6Zm0 1.62a3.68 3.68 0 1 0 0 7.36 3.68 3.68 0 0 0 0-7.36Zm5.5-.92a1.24 1.24 0 1 1-2.48 0 1.24 1.24 0 0 1 2.48 0Z" /></svg>
              </Social>
              <Social href={company.socials.facebook} label="Facebook">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.03 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" /></svg>
              </Social>
              <Social href={company.socials.linkedin} label="LinkedIn">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0Z" /></svg>
              </Social>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4" data-rtr-field="ov:footer.explore_title">{t("footer.explore_title", "Explore")}</h4>
            <ul className="space-y-3 text-white/75">
              <li><Link href="/plans" className="hover:text-[var(--color-cyan)] transition-colors"><span data-rtr-field="ov:footer.link_plans">{t("footer.link_plans", "Plans & Pricing")}</span></Link></li>
              <li><Link href="/coverage" className="hover:text-[var(--color-cyan)] transition-colors"><span data-rtr-field="ov:footer.link_coverage">{t("footer.link_coverage", "Check Coverage")}</span></Link></li>
              <li><Link href="/about" className="hover:text-[var(--color-cyan)] transition-colors"><span data-rtr-field="ov:footer.link_about">{t("footer.link_about", "About Us")}</span></Link></li>
              <li><Link href="/contact" className="hover:text-[var(--color-cyan)] transition-colors"><span data-rtr-field="ov:footer.link_contact">{t("footer.link_contact", "Contact & Support")}</span></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4" data-rtr-field="ov:footer.contact_title">{t("footer.contact_title", "Get in touch")}</h4>
            <ul className="space-y-3 text-white/75">
              <li>
                <a href={`tel:${company.phoneHref}`} className="flex items-center gap-2.5 hover:text-[var(--color-cyan)] transition-colors">
                  <Phone className="w-4 h-4 text-[var(--color-cyan)]" /> <span data-rtr-field="phone">{company.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="flex items-center gap-2.5 hover:text-[var(--color-cyan)] transition-colors break-all">
                  <Mail className="w-4 h-4 text-[var(--color-cyan)] shrink-0" /> <span data-rtr-field="email">{company.email}</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Pin className="w-4 h-4 text-[var(--color-cyan)]" /> <span data-rtr-field="address">{company.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-white/50">
          <p>© {new Date().getFullYear()} <span data-rtr-field="business_name">{company.name}</span>. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
            <p data-rtr-field="tagline">{company.tagline}</p>
            <RetiarCredit show={showsCredit(design)} className="hover:text-white" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--color-zoom)] flex items-center justify-center transition-colors"
    >
      {children}
    </a>
  );
}

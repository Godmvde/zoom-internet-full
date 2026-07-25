"use client";

import { useEffect, useState } from "react";
import { Whatsapp } from "./Icons";
import { makeT, type Overrides } from "@/lib/t";

export default function WhatsAppButton({ phone, overrides }: { phone: string; overrides?: Overrides }) {
  const t = makeT(overrides);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const msg = encodeURIComponent(
    "Hi Zoom Internet! I'd like to know more about getting connected."
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={`fixed z-50 bottom-5 right-5 flex items-center gap-3 transition-all duration-500 ${
        show ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
      }`}
    >
      <span className="hidden sm:block bg-white text-[var(--color-ink)] text-sm font-semibold px-4 py-2 rounded-full shadow-lg border border-[var(--color-line)]" data-rtr-field="ov:whatsapp.label">
        {t("whatsapp.label", "Chat with us")}
      </span>
      <span className="relative">
        <span className="absolute inset-0 rounded-full bg-[#25D366] pulse-ring" />
        <span className="relative w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl shadow-[#25D366]/40 hover:scale-105 transition-transform">
          <Whatsapp className="w-7 h-7" />
        </span>
      </span>
    </a>
  );
}

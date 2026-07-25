"use client";

import { useState } from "react";
import { coverageAreas, company } from "@/lib/content";
import { Check, Arrow, Pin } from "./Icons";
import { makeT, type Overrides } from "@/lib/t";

type Result = "in" | "out" | null;

export default function CoverageChecker({ overrides }: { overrides?: Overrides }) {
  const t = makeT(overrides);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [checking, setChecking] = useState(false);
  const [waitName, setWaitName] = useState("");
  const [waitPhone, setWaitPhone] = useState("");
  const [joined, setJoined] = useState(false);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    setChecking(true);
    setResult(null);
    // Brief artificial delay for a "scanning" feel
    setTimeout(() => {
      const hit = coverageAreas.some(
        (a) => a.toLowerCase().includes(q) || q.includes(a.toLowerCase())
      );
      setResult(hit ? "in" : "out");
      setChecking(false);
    }, 750);
  };

  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "waitlist",
          name: waitName,
          phone: waitPhone,
          area: query,
        }),
      });
    } catch {
      /* non-blocking */
    }
    setJoined(true);
  };

  return (
    <div className="card p-7 sm:p-9 shadow-[0_30px_70px_-40px_rgba(10,30,80,0.4)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="chip"><Pin className="w-3.5 h-3.5" /> <span data-rtr-field="ov:coverage.chip">{t("coverage.chip", "Coverage Checker")}</span></span>
      </div>
      <h3 className="display text-2xl sm:text-[1.7rem] text-[var(--color-heading)]" data-rtr-field="ov:coverage.heading">
        {t("coverage.heading", "Are you in the Zoom zone?")}
      </h3>
      <p className="text-[var(--color-slate)] mt-2 mb-5" data-rtr-field="ov:coverage.sub">
        {t("coverage.sub", "Enter your town or community and we'll check availability instantly.")}
      </p>

      <form onSubmit={check} className="flex flex-col sm:flex-row gap-3">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setResult(null);
            setJoined(false);
          }}
          placeholder={t("coverage.placeholder", "e.g. Rose Hall, Ironshore, Bogue…")}
          className="flex-1 rounded-full border border-[var(--color-line)] bg-[var(--color-mist)] px-5 py-3.5 outline-none focus:border-[var(--color-zoom)] focus:ring-4 focus:ring-[var(--color-zoom)]/10 transition"
        />
        <button type="submit" className="btn btn-primary whitespace-nowrap" disabled={checking}>
          {checking ? t("coverage.btn_scanning", "Scanning…") : (<><span data-rtr-field="ov:coverage.btn_check">{t("coverage.btn_check", "Check")}</span> <Arrow className="w-4 h-4" /></>)}
        </button>
      </form>

      {result === "in" && (
        <div className="mt-5 rounded-2xl bg-[#e9faf0] border border-[#bdedd0] p-5 flex gap-3 items-start">
          <span className="w-9 h-9 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-[#15803d]" data-rtr-field="ov:coverage.in_title">{t("coverage.in_title", "Great news — you're in coverage! 🎉")}</p>
            <p className="text-[var(--color-slate)] text-sm mt-1" data-rtr-field="ov:coverage.in_text">
              {t("coverage.in_text", "Zoom Internet is available in your area. Pick a plan and we'll get you connected, usually within a few days.")}
            </p>
            <a href="/plans" className="btn btn-primary mt-4 !py-2.5 !px-5 text-sm">
              <span data-rtr-field="ov:coverage.in_cta">{t("coverage.in_cta", "See plans")}</span> <Arrow className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {result === "out" && !joined && (
        <div className="mt-5 rounded-2xl bg-[var(--color-sky)] border border-[var(--color-sky-line)] p-5">
          <p className="font-semibold text-[var(--color-heading)]" data-rtr-field="ov:coverage.out_title">{t("coverage.out_title", "We're not in your area just yet.")}</p>
          <p className="text-[var(--color-slate)] text-sm mt-1 mb-4">
            <span data-rtr-field="ov:coverage.out_text">{t("coverage.out_text", "We're expanding across western Jamaica all the time. Join the waitlist and we'll notify you the moment Zoom reaches")}</span>{" "}
            <span className="font-medium">{query}</span>.
          </p>
          <form onSubmit={joinWaitlist} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
            <input
              required
              value={waitName}
              onChange={(e) => setWaitName(e.target.value)}
              placeholder={t("coverage.wait_name_ph", "Your name")}
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-mist)] px-4 py-3 outline-none focus:border-[var(--color-zoom)] transition"
            />
            <input
              required
              value={waitPhone}
              onChange={(e) => setWaitPhone(e.target.value)}
              placeholder={t("coverage.wait_phone_ph", "Phone number")}
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-mist)] px-4 py-3 outline-none focus:border-[var(--color-zoom)] transition"
            />
            <button type="submit" className="btn btn-primary whitespace-nowrap"><span data-rtr-field="ov:coverage.wait_btn">{t("coverage.wait_btn", "Notify me")}</span></button>
          </form>
        </div>
      )}

      {joined && (
        <div className="mt-5 rounded-2xl bg-[#e9faf0] border border-[#bdedd0] p-5 flex gap-3 items-start">
          <span className="w-9 h-9 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-[#15803d]" data-rtr-field="ov:coverage.joined_title">{t("coverage.joined_title", "You're on the list!")}</p>
            <p className="text-[var(--color-slate)] text-sm mt-1">
              <span data-rtr-field="ov:coverage.joined_thanks">{t("coverage.joined_thanks", "Thanks")}</span> {waitName.split(" ")[0]} — <span data-rtr-field="ov:coverage.joined_text">{t("coverage.joined_text", "we'll reach out as soon as we expand to your area. Need it sooner? Call us at")}</span>{" "}
              <a className="text-[var(--color-zoom)] font-medium" href={`tel:${company.phoneHref}`}>{company.phone}</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { coverageAreas, company } from "@/lib/content";
import { Check, Arrow, Pin } from "./Icons";

type Result = "in" | "out" | null;

export default function CoverageChecker() {
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
        <span className="chip"><Pin className="w-3.5 h-3.5" /> Coverage Checker</span>
      </div>
      <h3 className="display text-2xl sm:text-[1.7rem] text-[var(--color-heading)]">
        Are you in the Zoom zone?
      </h3>
      <p className="text-[var(--color-slate)] mt-2 mb-5">
        Enter your town or community and we&apos;ll check availability instantly.
      </p>

      <form onSubmit={check} className="flex flex-col sm:flex-row gap-3">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setResult(null);
            setJoined(false);
          }}
          placeholder="e.g. Rose Hall, Ironshore, Bogue…"
          className="flex-1 rounded-full border border-[var(--color-line)] bg-[var(--color-mist)] px-5 py-3.5 outline-none focus:border-[var(--color-zoom)] focus:ring-4 focus:ring-[var(--color-zoom)]/10 transition"
        />
        <button type="submit" className="btn btn-primary whitespace-nowrap" disabled={checking}>
          {checking ? "Scanning…" : (<>Check <Arrow className="w-4 h-4" /></>)}
        </button>
      </form>

      {result === "in" && (
        <div className="mt-5 rounded-2xl bg-[#e9faf0] border border-[#bdedd0] p-5 flex gap-3 items-start">
          <span className="w-9 h-9 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-[#15803d]">Great news — you&apos;re in coverage! 🎉</p>
            <p className="text-[var(--color-slate)] text-sm mt-1">
              Zoom Internet is available in your area. Pick a plan and we&apos;ll get you connected, usually within a few days.
            </p>
            <a href="/plans" className="btn btn-primary mt-4 !py-2.5 !px-5 text-sm">
              See plans <Arrow className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {result === "out" && !joined && (
        <div className="mt-5 rounded-2xl bg-[var(--color-sky)] border border-[var(--color-sky-line)] p-5">
          <p className="font-semibold text-[var(--color-heading)]">We&apos;re not in your area just yet.</p>
          <p className="text-[var(--color-slate)] text-sm mt-1 mb-4">
            We&apos;re expanding across western Jamaica all the time. Join the waitlist and we&apos;ll
            notify you the moment Zoom reaches <span className="font-medium">{query}</span>.
          </p>
          <form onSubmit={joinWaitlist} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
            <input
              required
              value={waitName}
              onChange={(e) => setWaitName(e.target.value)}
              placeholder="Your name"
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-mist)] px-4 py-3 outline-none focus:border-[var(--color-zoom)] transition"
            />
            <input
              required
              value={waitPhone}
              onChange={(e) => setWaitPhone(e.target.value)}
              placeholder="Phone number"
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-mist)] px-4 py-3 outline-none focus:border-[var(--color-zoom)] transition"
            />
            <button type="submit" className="btn btn-primary whitespace-nowrap">Notify me</button>
          </form>
        </div>
      )}

      {joined && (
        <div className="mt-5 rounded-2xl bg-[#e9faf0] border border-[#bdedd0] p-5 flex gap-3 items-start">
          <span className="w-9 h-9 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-[#15803d]">You&apos;re on the list!</p>
            <p className="text-[var(--color-slate)] text-sm mt-1">
              Thanks {waitName.split(" ")[0]} — we&apos;ll reach out as soon as we expand to your area.
              Need it sooner? Call us at{" "}
              <a className="text-[var(--color-zoom)] font-medium" href={`tel:${company.phoneHref}`}>{company.phone}</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

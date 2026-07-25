"use client";

import { useState } from "react";
import { referral, company } from "@/lib/content";
import { Check, Arrow } from "./Icons";
import { makeT, type Overrides } from "@/lib/t";

export default function Referral({ overrides }: { overrides?: Overrides }) {
  const t = makeT(overrides);
  const [form, setForm] = useState({ name: "", phone: "", friend: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "referral",
          name: form.name,
          phone: form.phone,
          message: `Referral — friend to contact: ${form.friend}`,
        }),
      });
      const data = await res.json();
      setStatus(data.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative grid lg:grid-cols-2 gap-10 p-9 sm:p-12 items-center">
        <div>
          <span className="chip !bg-white/10 !text-[var(--color-cyan)] !border-white/15" data-rtr-field="ov:referral.chip">{t("referral.chip", "Refer & earn")}</span>
          <h2 className="display text-3xl sm:text-[2.4rem] mt-4">
            <span data-rtr-field="ov:referral.headline_lead">{t("referral.headline_lead", "Give a friend Zoom, get")}</span>{" "}
            <span className="text-[var(--color-cyan)]" data-rtr-field="ov:referral.reward">{t("referral.reward", referral.reward.toLowerCase())}</span>.
          </h2>
          <p className="text-white/75 mt-4 max-w-md leading-relaxed" data-rtr-field="ov:referral.blurb">{t("referral.blurb", referral.blurb)}</p>
          <ul className="mt-6 space-y-3">
            {referral.perks.map((p, pi) => (
              <li key={p} className="flex items-center gap-3 text-white/85">
                <span className="w-6 h-6 rounded-full bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span data-rtr-field={`ov:referral.perk.${pi}`}>{t(`referral.perk.${pi}`, p)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-2xl p-7 text-left text-[var(--color-slate)]">
          {status === "done" ? (
            <div className="text-center py-6">
              <span className="mx-auto w-12 h-12 rounded-full bg-[#16a34a] text-white flex items-center justify-center mb-4">
                <Check className="w-6 h-6" />
              </span>
              <h3 className="display text-xl text-[var(--color-heading)]" data-rtr-field="ov:referral.done_title">{t("referral.done_title", "Referral submitted!")}</h3>
              <p className="text-[var(--color-slate)] text-sm mt-2">
                <span data-rtr-field="ov:referral.done_thanks">{t("referral.done_thanks", "Thanks")}</span> {form.name.split(" ")[0]}! <span data-rtr-field="ov:referral.done_text">{t("referral.done_text", "Once your friend connects, we'll apply your free month automatically.")}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <h3 className="display text-xl text-[var(--color-heading)]" data-rtr-field="ov:referral.form_title">{t("referral.form_title", "Refer a friend")}</h3>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("referral.name_ph", "Your name")} className={refInput} />
              <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={t("referral.phone_ph", "Your phone (so we can credit you)")} className={refInput} />
              <input required value={form.friend} onChange={(e) => set("friend", e.target.value)} placeholder={t("referral.friend_ph", "Friend's name & phone")} className={refInput} />
              {status === "error" && (
                <p className="text-sm text-red-500"><span data-rtr-field="ov:referral.error">{t("referral.error", "Something went wrong — please call")}</span> {company.phone}.</p>
              )}
              <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full">
                {status === "sending" ? t("referral.btn_sending", "Sending…") : (<><span data-rtr-field="ov:referral.btn_send">{t("referral.btn_send", "Send referral")}</span> <Arrow className="w-4 h-4" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const refInput =
  "w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-mist)] px-4 py-3 outline-none focus:border-[var(--color-zoom)] focus:ring-4 focus:ring-[var(--color-zoom)]/10 transition";

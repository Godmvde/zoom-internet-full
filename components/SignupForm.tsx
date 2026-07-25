"use client";

import { useState, useEffect } from "react";
import { plans, company } from "@/lib/content";
import { Check, Arrow } from "./Icons";
import { makeT, type Overrides } from "@/lib/t";

export default function SignupForm({
  defaultPlan,
  type = "signup",
  heading = "Get connected",
  sub = "Tell us a little about you and our Mobay team will reach out to schedule your install.",
  overrides,
}: {
  defaultPlan?: string;
  type?: "signup" | "contact";
  heading?: string;
  sub?: string;
  overrides?: Overrides;
}) {
  const t = makeT(overrides);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    plan: defaultPlan || plans[1].name,
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  // When rendered without a server-passed defaultPlan (e.g. inside a published
  // Puck layout), still honor a ?plan= deep link by reading it on the client.
  useEffect(() => {
    if (defaultPlan) return;
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p) setForm((f) => ({ ...f, plan: p }));
  }, [defaultPlan]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...form }),
      });
      const data = await res.json();
      setStatus(data.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    const waText = encodeURIComponent(
      `Hi Zoom Internet! I'm ${form.name} from ${form.area || "my area"}. I'd like the ${form.plan} plan.`
    );
    return (
      <div className="card p-8 sm:p-10 text-center">
        <span className="mx-auto w-14 h-14 rounded-full bg-[#16a34a] text-white flex items-center justify-center mb-5">
          <Check className="w-7 h-7" />
        </span>
        <h3 className="display text-2xl text-[var(--color-heading)]" data-rtr-field="ov:signup.done_title">{t("signup.done_title", "Request received! 🎉")}</h3>
        <p className="text-[var(--color-slate)] mt-3 max-w-md mx-auto">
          <span data-rtr-field="ov:signup.done_thanks">{t("signup.done_thanks", "Thanks")}</span> {form.name.split(" ")[0]} — <span data-rtr-field="ov:signup.done_call">{t("signup.done_call", "our team will call you at")}</span>{" "}
          <span className="font-medium text-[var(--color-heading)]">{form.phone}</span> <span data-rtr-field="ov:signup.done_confirm">{t("signup.done_confirm", "shortly to confirm your")}</span> <span className="font-medium text-[var(--color-heading)]">{form.plan}</span> <span data-rtr-field="ov:signup.done_install">{t("signup.done_install", "install.")}</span>
        </p>
        <a
          href={`https://wa.me/${company.whatsapp}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-6"
        >
          <span data-rtr-field="ov:signup.done_wa">{t("signup.done_wa", "Speed it up on WhatsApp")}</span> <Arrow className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-7 sm:p-9">
      <h3 className="display text-2xl sm:text-[1.7rem] text-[var(--color-heading)]" data-rtr-field="ov:signup.heading">{t("signup.heading", heading)}</h3>
      <p className="text-[var(--color-slate)] mt-2 mb-6" data-rtr-field="ov:signup.sub">{t("signup.sub", sub)}</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("signup.label_name", "Full name")} labelField="ov:signup.label_name" required>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder={t("signup.ph_name", "Jane Brown")} />
        </Field>
        <Field label={t("signup.label_phone", "Phone")} labelField="ov:signup.label_phone" required>
          <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder={t("signup.ph_phone", "876-000-0000")} />
        </Field>
        <Field label={t("signup.label_email", "Email")} labelField="ov:signup.label_email">
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder={t("signup.ph_email", "you@email.com")} />
        </Field>
        <Field label={t("signup.label_area", "Town / community")} labelField="ov:signup.label_area">
          <input value={form.area} onChange={(e) => set("area", e.target.value)} className={inputCls} placeholder={t("signup.ph_area", "Rose Hall")} />
        </Field>
      </div>

      {type === "signup" && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5" data-rtr-field="ov:signup.label_plan">{t("signup.label_plan", "Plan")}</label>
          <div className="grid sm:grid-cols-3 gap-2">
            {plans.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => set("plan", p.name)}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  form.plan === p.name
                    ? "border-[var(--color-zoom)] bg-[var(--color-sky)] ring-2 ring-[var(--color-zoom)]/20"
                    : "border-[var(--color-line)] hover:border-[var(--color-sky-line)]"
                }`}
              >
                <div className="font-semibold text-[var(--color-heading)] text-sm" data-rtr-field={`ov:plan.${p.id}.name`}>{t(`plan.${p.id}.name`, p.name)}</div>
                <div className="text-xs text-[var(--color-slate)]">{p.speed} Mbps</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5" data-rtr-field={type === "signup" ? "ov:signup.label_message_signup" : "ov:signup.label_message_contact"}>
          {type === "signup" ? t("signup.label_message_signup", "Anything we should know? (optional)") : t("signup.label_message_contact", "Message")}
        </label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputCls} resize-none`}
          placeholder={type === "signup" ? t("signup.ph_message_signup", "Best time to reach you, install notes…") : t("signup.ph_message_contact", "How can we help?")}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500 mt-3">
          <span data-rtr-field="ov:signup.error">{t("signup.error", "Something went wrong. Please call us at")}</span> {company.phone} <span data-rtr-field="ov:signup.error_retry">{t("signup.error_retry", "or try again.")}</span>
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full mt-6">
        {status === "sending" ? t("signup.btn_sending", "Sending…") : type === "signup" ? t("signup.btn_signup", "Request installation") : t("signup.btn_contact", "Send message")}
        {status !== "sending" && <Arrow className="w-4 h-4" />}
      </button>
      <p className="text-xs text-[var(--color-muted)] text-center mt-3" data-rtr-field="ov:signup.disclaimer">
        {t("signup.disclaimer", "No obligation. We'll never share your details.")}
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-mist)] px-4 py-3 outline-none focus:border-[var(--color-zoom)] focus:ring-4 focus:ring-[var(--color-zoom)]/10 transition";

function Field({ label, required, children, labelField }: { label: string; required?: boolean; children: React.ReactNode; labelField?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
        <span {...(labelField ? { "data-rtr-field": labelField } : {})}>{label}</span> {required && <span className="text-[var(--color-zoom)]">*</span>}
      </label>
      {children}
    </div>
  );
}

"use client";

import { useState } from "react";
import { plans, company } from "@/lib/content";
import { Check, Arrow } from "./Icons";

export default function SignupForm({
  defaultPlan,
  type = "signup",
  heading = "Get connected",
  sub = "Tell us a little about you and our Mobay team will reach out to schedule your install.",
}: {
  defaultPlan?: string;
  type?: "signup" | "contact";
  heading?: string;
  sub?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    plan: defaultPlan || plans[1].name,
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

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
        <h3 className="display text-2xl text-[var(--color-heading)]">Request received! 🎉</h3>
        <p className="text-[var(--color-slate)] mt-3 max-w-md mx-auto">
          Thanks {form.name.split(" ")[0]} — our team will call you at{" "}
          <span className="font-medium text-[var(--color-heading)]">{form.phone}</span> shortly to confirm
          your <span className="font-medium text-[var(--color-heading)]">{form.plan}</span> install.
        </p>
        <a
          href={`https://wa.me/${company.whatsapp}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-6"
        >
          Speed it up on WhatsApp <Arrow className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-7 sm:p-9">
      <h3 className="display text-2xl sm:text-[1.7rem] text-[var(--color-heading)]">{heading}</h3>
      <p className="text-[var(--color-slate)] mt-2 mb-6">{sub}</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" required>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Jane Brown" />
        </Field>
        <Field label="Phone" required>
          <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="876-000-0000" />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="you@email.com" />
        </Field>
        <Field label="Town / community">
          <input value={form.area} onChange={(e) => set("area", e.target.value)} className={inputCls} placeholder="Rose Hall" />
        </Field>
      </div>

      {type === "signup" && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">Plan</label>
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
                <div className="font-semibold text-[var(--color-heading)] text-sm">{p.name}</div>
                <div className="text-xs text-[var(--color-slate)]">{p.speed} Mbps</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
          {type === "signup" ? "Anything we should know? (optional)" : "Message"}
        </label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputCls} resize-none`}
          placeholder={type === "signup" ? "Best time to reach you, install notes…" : "How can we help?"}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500 mt-3">
          Something went wrong. Please call us at {company.phone} or try again.
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full mt-6">
        {status === "sending" ? "Sending…" : type === "signup" ? "Request installation" : "Send message"}
        {status !== "sending" && <Arrow className="w-4 h-4" />}
      </button>
      <p className="text-xs text-[var(--color-muted)] text-center mt-3">
        No obligation. We&apos;ll never share your details.
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-mist)] px-4 py-3 outline-none focus:border-[var(--color-zoom)] focus:ring-4 focus:ring-[var(--color-zoom)]/10 transition";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
        {label} {required && <span className="text-[var(--color-zoom)]">*</span>}
      </label>
      {children}
    </div>
  );
}

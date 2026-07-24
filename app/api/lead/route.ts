import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Captures sign-up / contact / waitlist / referral leads and delivers them.
//
// Delivery channels (all optional, configured via env — see .env.example):
//   1. Local file   — always; appends to .leads/leads.jsonl (dev backup)
//   2. Email        — if RESEND_API_KEY + LEAD_TO_EMAIL are set (Resend REST API)
//   3. WhatsApp     — if WHATSAPP_PHONE + WHATSAPP_APIKEY are set (CallMeBot);
//                     sends a WhatsApp message straight to the owner's number.
//   4. Webhook      — if LEAD_WEBHOOK_URL is set; POSTs the raw lead JSON.
//                     Point it at a Zapier/Make/Twilio hook to fan out to
//                     WhatsApp, SMS, a CRM, Google Sheets, etc.
//
// The request always returns { ok: true } once captured, so a misconfigured
// or down delivery channel never blocks the customer's submission.

type Lead = {
  type: "signup" | "contact" | "waitlist" | "referral";
  name?: string;
  phone?: string;
  email?: string;
  area?: string;
  plan?: string;
  message?: string;
  receivedAt: string;
};

async function writeLead(lead: Lead) {
  try {
    const dir = path.join(process.cwd(), ".leads");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(path.join(dir, "leads.jsonl"), JSON.stringify(lead) + "\n", "utf8");
  } catch {
    // read-only/serverless filesystems can't write — non-fatal.
  }
}

function leadLines(lead: Lead): string[] {
  return [
    ["Type", lead.type],
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Area", lead.area],
    ["Plan", lead.plan],
    ["Message", lead.message],
    ["Received", lead.receivedAt],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`);
}

async function emailLead(lead: Lead) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_TO_EMAIL;
  if (!key || !to) return false;
  const from = process.env.LEAD_FROM_EMAIL || "Zoom Internet <onboarding@resend.dev>";
  const lines = leadLines(lead);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()),
        reply_to: lead.email || undefined,
        subject: `New ${lead.type} lead — ${lead.name || lead.phone || "website"}`,
        text: `New lead from the Zoom Internet website:\n\n${lines.join("\n")}`,
        html: `<h2 style="font-family:sans-serif">New ${lead.type} lead</h2>` +
          `<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">` +
          lines
            .map(
              (l) =>
                `<tr><td style="padding:4px 12px 4px 0;color:#6b7a90">${l.split(": ")[0]}</td>` +
                `<td style="padding:4px 0;font-weight:600">${l.split(": ").slice(1).join(": ")}</td></tr>`
            )
            .join("") +
          `</table>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function whatsappLead(lead: Lead) {
  const phone = process.env.WHATSAPP_PHONE;
  const apikey = process.env.WHATSAPP_APIKEY;
  if (!phone || !apikey) return false;
  const lines = leadLines(lead);
  const text = `🔵 New Zoom Internet ${lead.type} lead\n\n${lines.join("\n")}`;
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

async function webhookLead(lead: Lead) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Forward the lead to the Retiar dashboard so it shows up alongside every
// other client's leads. Extra Zoom-specific fields fold into the message.
async function retiarLead(lead: Lead) {
  try {
    const extra = [
      lead.area && `Area: ${lead.area}`,
      lead.plan && `Plan: ${lead.plan}`,
    ]
      .filter(Boolean)
      .join(" · ");
    const message = [lead.message, extra].filter(Boolean).join("\n\n");
    const res = await fetch("https://retiar.vercel.app/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site: "zoom-internet-full",
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message,
        source: lead.type,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  let body: Partial<Lead>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!body.name && !body.phone && !body.email) {
    return NextResponse.json(
      { ok: false, error: "Please provide a name and a way to reach you." },
      { status: 422 }
    );
  }

  const lead: Lead = {
    type: (body.type as Lead["type"]) || "contact",
    name: body.name?.toString().slice(0, 120),
    phone: body.phone?.toString().slice(0, 40),
    email: body.email?.toString().slice(0, 160),
    area: body.area?.toString().slice(0, 120),
    plan: body.plan?.toString().slice(0, 60),
    message: body.message?.toString().slice(0, 2000),
    receivedAt: new Date().toISOString(),
  };

  await writeLead(lead);
  // Fire delivery channels in parallel; never let them block the response.
  const [emailed, whatsapped, hooked, retiared] = await Promise.all([
    emailLead(lead),
    whatsappLead(lead),
    webhookLead(lead),
    retiarLead(lead),
  ]);

  return NextResponse.json({
    ok: true,
    delivered: {
      email: emailed,
      whatsapp: whatsapped,
      webhook: hooked,
      retiar: retiared,
    },
  });
}

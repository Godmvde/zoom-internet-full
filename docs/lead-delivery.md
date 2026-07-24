# Zoom Internet — where website leads go

Every coverage waitlist, sign-up, contact, and referral submission POSTs to
`/api/lead`. That endpoint always tries to capture the lead, and fans it out to
whichever delivery channels you've configured. **At least one must be set in
Vercel** for production leads to actually reach you (serverless has no writable
disk, so the local-file backup only works in development).

Set these in **Vercel → zoom-internet → Settings → Environment Variables**, then
redeploy.

| Channel | Env vars | Setup |
|--------|----------|-------|
| **Email** | `RESEND_API_KEY`, `LEAD_TO_EMAIL` | Sign up free at resend.com, create an API key. Sends a formatted email per lead. |
| **WhatsApp** | `WHATSAPP_PHONE`, `WHATSAPP_APIKEY` | One-time CallMeBot activation (see `.env.example`). Pings your WhatsApp per lead. |
| **Google Sheet** | `LEAD_WEBHOOK_URL` | Paste `google-sheets-lead-logger.gs` into a Sheet's Apps Script, deploy as a web app, use that URL. Logs every lead as a row. |
| **Anything else** | `LEAD_WEBHOOK_URL` | Point at a Zapier/Make "Catch Hook" or Twilio to fan out to SMS, a CRM, etc. |

You can enable several at once — e.g. WhatsApp for instant alerts **and** a Google
Sheet for a permanent searchable log. The API response shows which fired:
`{"ok":true,"delivered":{"email":true,"whatsapp":true,"webhook":true}}`.

See `google-sheets-lead-logger.gs` in this folder for the ready-to-paste Sheet script.

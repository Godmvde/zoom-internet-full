"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// A single browser Supabase client for the Studio. It persists the signed-in
// session (so a page reload keeps you logged in) and auto-refreshes the token.
// The JWT it carries is what the RLS-gated RPCs (save_content_draft, publish_site)
// authorize against — no session ⇒ the DB rejects writes ("not authorized").
let client: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (client) return client;
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "rtr-studio-auth",
      },
    },
  );
  adoptHandoffSession(client);
  return client;
}

// If Retiar opened this studio with a session handed off in the URL hash
// (#rtr_at=…&rtr_rt=…), adopt it so the admin lands already signed in, then
// scrub the hash from the URL. The hash is never sent to any server, and the
// onAuthStateChange listener in the studio picks up the session once it's set.
function adoptHandoffSession(sb: SupabaseClient): void {
  if (typeof window === "undefined") return;
  if (!window.location.hash.includes("rtr_at=")) return;
  try {
    const p = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access_token = p.get("rtr_at");
    const refresh_token = p.get("rtr_rt");
    if (access_token && refresh_token) {
      void sb.auth.setSession({ access_token, refresh_token });
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  } catch {
    /* malformed hash — ignore */
  }
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// First-party, cookieless page-view beacon for the Retiar dashboard. Fires once
// per page load / client-side route change. No cookies, no personal data — the
// server derives a rotating daily visitor hash and never stores an IP.
export default function RetiarAnalytics({ slug }: { slug: string }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/studio")) return;
    try {
      fetch("https://retiar.vercel.app/api/pv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          site: slug,
          path: pathname,
          ref: document.referrer,
        }),
        keepalive: true,
        mode: "cors",
      }).catch(() => {});
    } catch {
      /* never let analytics break the page */
    }
  }, [pathname, slug]);
  return null;
}

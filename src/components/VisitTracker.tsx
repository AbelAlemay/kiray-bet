"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { randomId } from "@/lib/random-id";

// Counts page views for the admin dashboard. A random id in a first-party cookie lets
// repeat views count as one visitor; no IP address or personal data is sent.
// Skipped when the browser asks not to be tracked (Global Privacy Control or Do Not
// Track) and on admin pages.

const cookieName = "kb_vid";

function visitorId() {
  const existing = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([0-9a-f-]{36})`))?.[1];
  if (existing) return existing;
  const id = randomId();
  document.cookie = `${cookieName}=${id}; path=/; max-age=31536000; SameSite=Lax`;
  return id;
}

function optedOut() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key || pathname.startsWith("/admin") || optedOut()) return;
    fetch(`${url}/rest/v1/rpc/record_visit`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ visitor: visitorId() }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}

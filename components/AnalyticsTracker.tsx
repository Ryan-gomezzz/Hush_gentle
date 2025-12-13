"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import type { AnalyticsEventName } from "@/lib/analytics";

async function postEvent(payload: {
  event_name: AnalyticsEventName;
  path: string;
  referrer?: string | null;
  meta?: Record<string, unknown>;
}) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // best-effort
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  React.useEffect(() => {
    if (!pathname) return;
    void postEvent({
      event_name: "page_view",
      path: pathname,
      referrer: document.referrer || null,
      meta: { ua: navigator.userAgent },
    });
  }, [pathname]);

  return null;
}



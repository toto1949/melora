"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";
import { isPublicAnalyticsPage, sanitizeAnalyticsUrl } from "@/lib/analytics/attribution";

function redactPrivateRouteData(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = sanitizeAnalyticsUrl(event.url);
  return url ? { ...event, url } : null;
}

export function VercelAnalytics() {
  const pathname = usePathname();

  return (
    <>
      <Analytics beforeSend={redactPrivateRouteData} />
      {isPublicAnalyticsPage(pathname) ? <SpeedInsights /> : null}
    </>
  );
}

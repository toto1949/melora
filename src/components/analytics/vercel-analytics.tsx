"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";
import { isPublicAnalyticsPage } from "@/lib/analytics/attribution";

export function VercelAnalytics() {
  const pathname = usePathname();
  if (!isPublicAnalyticsPage(pathname)) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

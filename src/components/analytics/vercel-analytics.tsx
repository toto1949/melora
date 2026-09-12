"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";
import { isPrivateAnalyticsPath } from "@/lib/analytics/attribution";

export function VercelAnalytics() {
  const pathname = usePathname();
  if (isPrivateAnalyticsPath(pathname)) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

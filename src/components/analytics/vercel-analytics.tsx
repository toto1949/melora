"use client";

import { Analytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";
import { isPrivateAnalyticsPath } from "@/lib/analytics/attribution";

export function VercelAnalytics() {
  const pathname = usePathname();
  return isPrivateAnalyticsPath(pathname) ? null : <Analytics />;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isPrivateAnalyticsPath, safePagePath } from "@/lib/analytics/attribution";
import { ensureAnalyticsIdentity, sendAnalyticsEvent, trackExternalEvent } from "@/lib/analytics/client";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (isPrivateAnalyticsPath(pathname)) return;
    ensureAnalyticsIdentity();
    sendAnalyticsEvent("page_view", { path: safePagePath(pathname) || "/" });
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target) return;
      try {
        const destination = new URL(target.href, location.href);
        if (destination.origin !== location.origin || destination.pathname !== "/studio") return;
        const pagePath = safePagePath(location.pathname) || "/";
        sendAnalyticsEvent("create_song_clicked", { path: pagePath, destination: destination.pathname });
        trackExternalEvent("create_song_click", { link_url: destination.pathname, page_path: pagePath });
      } catch {
        // Ignore malformed links without affecting navigation.
      }
    };
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}

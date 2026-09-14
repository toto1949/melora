"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isPrivateAnalyticsPath, safePagePath } from "@/lib/analytics/attribution";
import { ensureAnalyticsIdentity, sendAnalyticsEvent, trackExternalEvent } from "@/lib/analytics/client";
import { createPageVisitGuard } from "@/lib/analytics/page-visit";

const shouldRecordPageVisit = createPageVisitGuard();
const LAST_PAGE_KEY = "mtm_last_page_view_path";
const initialDocumentPath = typeof window === "undefined" ? null : window.location.pathname;

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (isPrivateAnalyticsPath(pathname)) {
      shouldRecordPageVisit(null);
      return;
    }
    const path = safePagePath(pathname);
    if (!path || !ensureAnalyticsIdentity()) return;

    // Prefetched server renders never mount this component. Repeated effects on
    // the same route, including router.refresh(), also cannot create new visits.
    let previousPath: string | null = null;
    try { previousPath = sessionStorage.getItem(LAST_PAGE_KEY); } catch { /* storage may be blocked */ }
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isReload = navigation?.type === "reload" && pathname === initialDocumentPath;
    if (!shouldRecordPageVisit(path, isReload, previousPath)) return;
    try { sessionStorage.setItem(LAST_PAGE_KEY, path); } catch { /* best effort */ }
    sendAnalyticsEvent("page_view", { path });
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

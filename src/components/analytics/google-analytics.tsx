"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import type { CookieConsentValue } from "@/lib/cookie-consent";
import { isExternalAnalyticsPath, isPublicAnalyticsPage, safePagePath } from "@/lib/analytics/attribution";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics({
  measurementId,
  initialConsent,
}: {
  measurementId: string;
  initialConsent: CookieConsentValue | null;
}) {
  const pathname = usePathname();
  const enabled = Boolean(measurementId) && isExternalAnalyticsPath(pathname);

  useEffect(() => {
    if (!enabled || !isPublicAnalyticsPage(pathname) || initialConsent !== "all") return;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sendPageView = () => {
      if (window.gtag) {
        const pagePath = safePagePath(pathname) || "/";
        window.gtag("event", "page_view", {
          page_path: pagePath,
          page_location: `${location.origin}${pagePath}`,
          page_title: document.title,
        });
        return;
      }
      attempts += 1;
      if (attempts < 20) timer = setTimeout(sendPageView, 250);
    };
    sendPageView();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [enabled, initialConsent, measurementId, pathname]);

  if (!enabled) return null;

  const analyticsStorage = initialConsent === "all" ? "granted" : "denied";

  return (
    <>
      <Script id="google-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            analytics_storage: '${analyticsStorage}',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){dataLayer.push(arguments);};
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false, anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

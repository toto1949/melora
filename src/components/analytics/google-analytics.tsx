"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import type { CookieConsentValue } from "@/lib/cookie-consent";

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

  useEffect(() => {
    if (!measurementId || initialConsent !== "all" || !window.gtag) return;
    window.gtag("config", measurementId, {
      page_path: pathname,
      anonymize_ip: true,
    });
  }, [initialConsent, measurementId, pathname]);

  if (!measurementId) return null;

  const analyticsStorage = initialConsent === "all" ? "granted" : "denied";

  return (
    <>
      <Script id="google-consent-default" strategy="beforeInteractive">
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

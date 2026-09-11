"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { isExternalAnalyticsPath, isPublicAnalyticsPage } from "@/lib/analytics/attribution";

export function TikTokPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const firstRoute = useRef(true);

  useEffect(() => {
    if (!isExternalAnalyticsPath(pathname)) return;
    if (firstRoute.current) firstRoute.current = false;
    else if (isPublicAnalyticsPage(pathname)) {
      try { window.ttq?.page?.(); } catch { /* best effort */ }
    }
  }, [pathname]);

  if (!pixelId || !isExternalAnalyticsPath(pathname)) return null;
  return (
    <Script id="tiktok-pixel" strategy="afterInteractive">
      {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js',o=n&&n.partner;ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var a=document.createElement('script');a.type='text/javascript';a.async=!0;a.src=r+'?sdkid='+e+'&lib='+t;var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(a,s)};ttq.load('${pixelId}');${isPublicAnalyticsPage(pathname) ? "ttq.page();" : ""}}(window,document,'ttq');`}
    </Script>
  );
}

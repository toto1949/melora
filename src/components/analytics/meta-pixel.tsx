"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function trackMetaEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return false;
  window.fbq("track", eventName, parameters || {});
  return true;
}

export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const firstRoute = useRef(true);

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
    } else {
      trackMetaEvent("PageView");
    }

    if (pathname === "/pricing") {
      let attempts = 0;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const sendViewContent = () => {
        if (
          trackMetaEvent("ViewContent", {
            content_name: "Personalized Audio Song",
            content_type: "product",
            value: 19,
            currency: "USD",
          })
        ) {
          return;
        }
        attempts += 1;
        if (attempts < 20) timer = setTimeout(sendViewContent, 250);
      };
      sendViewContent();
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [pathname]);

  if (!pixelId) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
    </Script>
  );
}

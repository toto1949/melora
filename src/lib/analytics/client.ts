"use client";

import type { AttributionTouch } from "@/types";
import { COOKIE_CONSENT } from "@/lib/cookie-consent";
import {
  ANALYTICS_FIRST_TOUCH_COOKIE,
  ANALYTICS_LAST_TOUCH_COOKIE,
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_TEST_COOKIE,
  ANALYTICS_VISITOR_COOKIE,
  captureAttribution,
  encodeAttributionCookie,
  parseAttributionCookie,
} from "@/lib/analytics/attribution";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      page?: () => void;
      track?: (eventName: string, parameters?: Record<string, unknown>) => void;
    };
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const item = document.cookie.split("; ").find((value) => value.startsWith(prefix));
  return item ? item.slice(prefix.length) : null;
}

function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

function hasAnalyticsConsent() {
  return readCookie(COOKIE_CONSENT) === "all";
}

function externalReferrer() {
  try {
    return document.referrer && new URL(document.referrer).origin !== location.origin ? document.referrer : undefined;
  } catch {
    return undefined;
  }
}

export function ensureAnalyticsIdentity(): {
  visitorId: string;
  sessionId: string;
  firstTouch: AttributionTouch;
  lastTouch: AttributionTouch;
} | null {
  if (!hasAnalyticsConsent()) return null;

  const query = new URLSearchParams(location.search);
  if (location.hostname === "localhost" || location.hostname.endsWith(".vercel.app") || query.get("analytics_test") === "1") {
    writeCookie(ANALYTICS_TEST_COOKIE, "1", 60 * 60 * 24);
  }

  const visitorId = readCookie(ANALYTICS_VISITOR_COOKIE) || crypto.randomUUID();
  const sessionId = readCookie(ANALYTICS_SESSION_COOKIE) || crypto.randomUUID();
  writeCookie(ANALYTICS_VISITOR_COOKIE, visitorId, 60 * 60 * 24 * 180);
  writeCookie(ANALYTICS_SESSION_COOKIE, sessionId, 60 * 30);

  const captured = captureAttribution(location.search, location.pathname, externalReferrer());
  const existingFirst = parseAttributionCookie(readCookie(ANALYTICS_FIRST_TOUCH_COOKIE));
  const existingLast = parseAttributionCookie(readCookie(ANALYTICS_LAST_TOUCH_COOKIE));
  const firstTouch = existingFirst || captured.touch;
  const lastTouch = captured.hasCampaignSignal ? captured.touch : existingLast || captured.touch;
  writeCookie(ANALYTICS_FIRST_TOUCH_COOKIE, encodeAttributionCookie(firstTouch), 60 * 60 * 24 * 180);
  writeCookie(ANALYTICS_LAST_TOUCH_COOKIE, encodeAttributionCookie(lastTouch), 60 * 60 * 24 * 180);

  return { visitorId, sessionId, firstTouch, lastTouch };
}

export function sendAnalyticsEvent(
  eventName: "page_view" | "create_song_clicked" | "checkout_viewed" | "begin_checkout",
  properties: Record<string, string | number | boolean> = {},
  projectId?: string,
) {
  try {
    if (!ensureAnalyticsIdentity()) return;
    void fetch("/api/analytics", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: crypto.randomUUID(),
        eventName,
        properties,
        ...(projectId ? { projectId } : {}),
      }),
    }).catch(() => undefined);
  } catch {
    // Analytics is deliberately best-effort and must never interrupt the customer flow.
  }
}

export function trackExternalEvent(eventName: string, parameters: Record<string, unknown> = {}) {
  try { window.gtag?.("event", eventName, parameters); } catch { /* best effort */ }
}

export function trackCheckoutInitiated(input: {
  projectId: string;
  value: number;
  currency: string;
  itemName: string;
}) {
  const common = {
    value: input.value,
    currency: input.currency.toUpperCase(),
    content_name: input.itemName,
    content_type: "product",
    content_ids: ["personalized-audio-song"],
    num_items: 1,
  };
  try {
    sendAnalyticsEvent("begin_checkout", { value_cents: Math.round(input.value * 100), currency: input.currency }, input.projectId);
    window.gtag?.("event", "begin_checkout", {
      value: input.value,
      currency: input.currency.toUpperCase(),
      items: [{ item_id: "personalized-audio-song", item_name: input.itemName, price: input.value, quantity: 1 }],
    });
    window.fbq?.("track", "InitiateCheckout", common);
    window.ttq?.track?.("InitiateCheckout", common);
  } catch {
    // Navigation to Stripe must continue even if every analytics provider fails.
  }
}

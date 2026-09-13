import type { AttributionTouch } from "@/types";

export const ANALYTICS_VISITOR_COOKIE = "mtm_analytics_visitor";
export const ANALYTICS_SESSION_COOKIE = "mtm_analytics_session";
export const ANALYTICS_FIRST_TOUCH_COOKIE = "mtm_first_touch";
export const ANALYTICS_LAST_TOUCH_COOKIE = "mtm_last_touch";
export const ANALYTICS_TEST_COOKIE = "mtm_analytics_test";

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "gclid",
  "fbclid",
  "ttclid",
] as const;

const VALUE_LIMITS: Record<(typeof ATTRIBUTION_KEYS)[number], number> = {
  utm_source: 80,
  utm_medium: 80,
  utm_campaign: 160,
  utm_content: 160,
  gclid: 255,
  fbclid: 255,
  ttclid: 255,
};

function clean(value: string | null | undefined, maxLength: number) {
  if (!value) return undefined;
  const normalized = value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength);
  return normalized || undefined;
}

export function normalizeTrafficSource(value: string | undefined) {
  const source = value?.trim().toLowerCase() || "direct";
  if (["ig", "instagram"].includes(source) || source === "instagram.com" || source.endsWith(".instagram.com")) return "instagram";
  if (["fb", "facebook"].includes(source) || source === "facebook.com" || source.endsWith(".facebook.com")) return "facebook";
  if (["tt", "tiktok"].includes(source) || source === "tiktok.com" || source.endsWith(".tiktok.com")) return "tiktok";
  if (["google", "google.com"].includes(source)) return "google";
  return clean(source, 80) || "direct";
}

export function captureAttribution(
  search: string,
  pathname: string,
  referrer?: string,
): { touch: AttributionTouch; hasCampaignSignal: boolean } {
  const params = new URLSearchParams(search);
  const values = Object.fromEntries(
    ATTRIBUTION_KEYS.flatMap((key) => {
      const value = clean(params.get(key), VALUE_LIMITS[key]);
      return value ? [[key, value]] : [];
    }),
  ) as Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

  let referrerHost: string | undefined;
  try {
    referrerHost = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : undefined;
  } catch {
    referrerHost = undefined;
  }

  const referrerSource = referrerHost ? normalizeTrafficSource(referrerHost) : undefined;
  const socialReferrer = referrerSource && ["instagram", "facebook", "tiktok"].includes(referrerSource)
    ? referrerSource
    : undefined;
  const inferred = values.utm_source
    || (values.ttclid ? "tiktok" : undefined)
    || socialReferrer
    || (values.fbclid ? "facebook" : undefined)
    || (values.gclid ? "google" : undefined)
    || referrerSource
    || "direct";

  return {
    hasCampaignSignal: ATTRIBUTION_KEYS.some((key) => Boolean(values[key])) || Boolean(referrerHost),
    touch: {
      source: normalizeTrafficSource(inferred),
      ...values,
      landing_path: safePagePath(pathname) || "/",
      ...(referrerHost ? { referrer_host: clean(referrerHost, 160) } : {}),
      captured_at: new Date().toISOString(),
    },
  };
}

export function encodeAttributionCookie(touch: AttributionTouch) {
  return encodeURIComponent(JSON.stringify(touch));
}

export function parseAttributionCookie(value: string | null | undefined): AttributionTouch | null {
  if (!value || value.length > 3000) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Record<string, unknown>;
    const source = clean(typeof parsed.source === "string" ? parsed.source : undefined, 80);
    if (!source) return null;
    const touch: AttributionTouch = { source: normalizeTrafficSource(source) };
    for (const key of ATTRIBUTION_KEYS) {
      const item = clean(typeof parsed[key] === "string" ? parsed[key] : undefined, VALUE_LIMITS[key]);
      if (item) touch[key] = item;
    }
    const landing = clean(typeof parsed.landing_path === "string" ? parsed.landing_path : undefined, 300);
    const referrerHost = clean(typeof parsed.referrer_host === "string" ? parsed.referrer_host : undefined, 160);
    const capturedAt = clean(typeof parsed.captured_at === "string" ? parsed.captured_at : undefined, 40);
    if (landing?.startsWith("/")) touch.landing_path = landing;
    if (referrerHost) touch.referrer_host = referrerHost;
    if (capturedAt && !Number.isNaN(Date.parse(capturedAt))) touch.captured_at = capturedAt;
    return touch;
  } catch {
    return null;
  }
}

export function safePagePath(value: string | null | undefined) {
  if (!value) return null;
  let path = value.split("?")[0].split("#")[0].slice(0, 300);
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  path = path.replace(/^\/studio\/[^/]+(?=\/|$)/, "/studio/[project]");
  path = path.replace(/^\/listen\/[^/]+(?=\/|$)/, "/listen/[order]");
  return path;
}

export function isPrivateAnalyticsPath(pathname: string) {
  return ["/admin", "/dashboard", "/api", "/auth", "/listen", "/studio", "/payment-success", "/payment-cancelled"]
    .some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isExternalAnalyticsPath(pathname: string) {
  return !["/admin", "/dashboard", "/api", "/auth", "/listen"]
    .some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isPublicAnalyticsPage(pathname: string) {
  return isExternalAnalyticsPath(pathname)
    && !["/studio", "/payment-success", "/payment-cancelled"]
      .some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

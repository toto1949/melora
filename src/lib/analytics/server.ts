import { cookies } from "next/headers";
import type { AnalyticsContext, AnalyticsEvent, Profile } from "@/types";
import { COOKIE_CONSENT } from "@/lib/cookie-consent";
import {
  ANALYTICS_FIRST_TOUCH_COOKIE,
  ANALYTICS_LAST_TOUCH_COOKIE,
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_TEST_COOKIE,
  ANALYTICS_VISITOR_COOKIE,
  parseAttributionCookie,
} from "@/lib/analytics/attribution";
import { trackEvent } from "@/lib/db/repository";
import { logEvent } from "@/lib/observability/logger";

const STAFF_ROLES = new Set(["super_admin", "support", "producer", "reviewer", "content_manager"]);
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function readServerAnalyticsContext(user?: Profile | null): Promise<AnalyticsContext> {
  const jar = await cookies();
  const hasConsent = jar.get(COOKIE_CONSENT)?.value === "all";
  const isInternal = process.env.VERCEL_ENV !== "production"
    || jar.get(ANALYTICS_TEST_COOKIE)?.value === "1"
    || Boolean(user && STAFF_ROLES.has(user.role));

  if (!hasConsent) return { isInternal };
  const visitorId = jar.get(ANALYTICS_VISITOR_COOKIE)?.value;
  const sessionId = jar.get(ANALYTICS_SESSION_COOKIE)?.value;
  return {
    visitorId: visitorId && ID_PATTERN.test(visitorId) ? visitorId : null,
    sessionId: sessionId && ID_PATTERN.test(sessionId) ? sessionId : null,
    firstTouch: parseAttributionCookie(jar.get(ANALYTICS_FIRST_TOUCH_COOKIE)?.value),
    lastTouch: parseAttributionCookie(jar.get(ANALYTICS_LAST_TOUCH_COOKIE)?.value),
    isInternal,
  };
}

export async function safeTrackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  ids: Partial<Pick<AnalyticsEvent, "sessionId" | "userId" | "projectId" | "orderId">> & AnalyticsContext = {},
) {
  if (ids.isInternal) return null;
  try {
    return await trackEvent(eventName, properties, ids);
  } catch (error) {
    logEvent("warn", "analytics_event_failed", {
      eventName,
      error: error instanceof Error ? error.message : "Unknown analytics error",
    });
    return null;
  }
}

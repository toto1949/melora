import { describe, expect, it } from "vitest";
import type { AnalyticsEvent } from "@/types";
import { captureAttribution, encodeAttributionCookie, parseAttributionCookie, safePagePath } from "@/lib/analytics/attribution";
import { buildAnalyticsDashboard } from "@/lib/analytics/dashboard";

function event(
  id: string,
  eventName: string,
  visitorId: string | null,
  overrides: Partial<AnalyticsEvent> = {},
): AnalyticsEvent {
  return {
    id,
    eventName,
    visitorId,
    sessionId: visitorId ? `session-${visitorId}` : null,
    userId: null,
    projectId: overrides.projectId ?? null,
    orderId: overrides.orderId ?? null,
    pagePath: overrides.pagePath ?? null,
    source: overrides.source ?? "tiktok",
    medium: overrides.medium ?? "paid_social",
    campaign: overrides.campaign ?? "launch",
    content: overrides.content ?? "video-a",
    isInternal: overrides.isInternal ?? false,
    dedupeKey: overrides.dedupeKey ?? null,
    properties: overrides.properties ?? {},
    createdAt: "2026-09-11T12:00:00.000Z",
  };
}

describe("campaign attribution", () => {
  it("captures click IDs without storing a raw referrer URL", () => {
    const result = captureAttribution("?utm_source=TikTok&utm_campaign=launch&ttclid=click_123", "/pricing", "https://www.tiktok.com/video/123?private=query");
    expect(result.touch).toMatchObject({ source: "tiktok", utm_source: "TikTok", utm_campaign: "launch", ttclid: "click_123", landing_path: "/pricing", referrer_host: "tiktok.com" });
    expect(JSON.stringify(result.touch)).not.toContain("private=query");
    expect(parseAttributionCookie(encodeAttributionCookie(result.touch))).toEqual(result.touch);
  });

  it("normalizes private dynamic paths before analytics storage", () => {
    expect(safePagePath("/studio/11111111-1111-4111-8111-111111111111/story?utm_source=x")).toBe("/studio/[project]/story");
    expect(safePagePath("https://attacker.test/path")).toBeNull();
  });
});

describe("analytics dashboard", () => {
  it("answers the paid-social funnel per 100 visitors and excludes internal traffic", () => {
    const views = Array.from({ length: 100 }, (_, index) => event(`view-${index}`, "page_view", `visitor-${index}`, { pagePath: index < 60 ? "/" : "/pricing" }));
    const studio = Array.from({ length: 25 }, (_, index) => event(`studio-${index}`, "studio_started", `visitor-${index}`, { projectId: `project-${index}` }));
    const checkout = Array.from({ length: 10 }, (_, index) => event(`checkout-${index}`, "checkout_viewed", `visitor-${index}`, { projectId: `project-${index}` }));
    const stripe = Array.from({ length: 8 }, (_, index) => event(`stripe-${index}`, "stripe_checkout_started", `visitor-${index}`, { orderId: `order-${index}` }));
    const internal = event("internal", "page_view", "staff", { isInternal: true, pagePath: "/" });
    const summary = buildAnalyticsDashboard("7d", "2026-09-04T00:00:00.000Z", [...views, ...studio, ...checkout, ...stripe, internal], [
      { id: "order-1", paidAt: "2026-09-11T12:00:00.000Z", paymentStatus: "paid", totalCents: 1999, refundedCents: 0, visitorId: "visitor-1", firstTouch: { source: "tiktok" }, lastTouch: { source: "tiktok", utm_campaign: "launch", utm_content: "video-a" }, isInternal: false },
      { id: "order-2", paidAt: "2026-09-11T12:00:00.000Z", paymentStatus: "paid", totalCents: 1999, refundedCents: 0, visitorId: "visitor-2", firstTouch: { source: "tiktok" }, lastTouch: { source: "tiktok", utm_campaign: "launch", utm_content: "video-a" }, isInternal: false },
      { id: "order-staff", paidAt: "2026-09-11T12:00:00.000Z", paymentStatus: "paid", totalCents: 1999, refundedCents: 0, visitorId: "staff", firstTouch: { source: "facebook" }, lastTouch: { source: "facebook" }, isInternal: true },
    ]);

    expect(summary).toMatchObject({ uniqueVisitors: 100, sessions: 100, pageViews: 100, studioStarts: 25, checkoutViews: 10, stripeCheckoutStarts: 8, purchases: 2, revenueCents: 3998, visitorToStudioRate: 25, visitorToPurchaseRate: 2 });
    expect(summary.sources.find((row) => row.source === "tiktok")).toMatchObject({ visitors: 100, studioStarts: 25, checkoutViews: 10, stripeCheckoutStarts: 8, purchases: 2, revenueCents: 3998 });
    expect(summary.topPages[0]).toEqual({ path: "/", views: 60 });
  });
});

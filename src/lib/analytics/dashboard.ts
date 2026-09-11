import type { AnalyticsDashboard, AnalyticsEvent, AttributionTouch } from "@/types";
import { normalizeTrafficSource } from "@/lib/analytics/attribution";

export type AnalyticsRange = AnalyticsDashboard["range"];

export interface AnalyticsOrderMetric {
  id: string;
  paidAt: string | null;
  paymentStatus: string;
  totalCents: number;
  refundedCents: number;
  visitorId: string | null;
  firstTouch: AttributionTouch | null;
  lastTouch: AttributionTouch | null;
  isInternal: boolean;
}

export function analyticsSince(range: AnalyticsRange, now = new Date()) {
  if (range === "today") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  }
  return new Date(now.getTime() - (range === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString();
}

const percent = (numerator: number, denominator: number) => denominator ? Math.round((numerator / denominator) * 1000) / 10 : 0;
const keyFor = (event: AnalyticsEvent) => event.visitorId || event.projectId || event.orderId || event.id;

export function buildAnalyticsDashboard(
  range: AnalyticsRange,
  since: string,
  inputEvents: AnalyticsEvent[],
  inputOrders: AnalyticsOrderMetric[],
): AnalyticsDashboard {
  const events = inputEvents.filter((event) => !event.isInternal);
  const orders = inputOrders.filter((order) => !order.isInternal && Boolean(order.paidAt) && order.paidAt! >= since);
  const byName = (names: string[]) => events.filter((event) => names.includes(event.eventName));
  const unique = (items: AnalyticsEvent[]) => new Set(items.map(keyFor)).size;
  const pageViewEvents = byName(["page_view"]);
  const visitorIds = new Set(pageViewEvents.flatMap((event) => event.visitorId ? [event.visitorId] : []));
  const sessionIds = new Set(pageViewEvents.flatMap((event) => event.sessionId ? [event.sessionId] : []));
  const attributable = (event: AnalyticsEvent) => Boolean(event.visitorId);
  const studioEvents = byName(["studio_started"]).filter(attributable);
  const checkoutViewEvents = byName(["checkout_viewed"]).filter(attributable);
  const stripeEvents = byName(["stripe_checkout_started"]).filter(attributable);
  const purchaseOrders = orders.filter((order) => ["paid", "refunded", "partially_refunded", "disputed"].includes(order.paymentStatus));
  const revenueFor = (order: AnalyticsOrderMetric) => order.paymentStatus === "disputed"
    ? 0
    : Math.max(0, order.totalCents - order.refundedCents);

  const pageCounts = new Map<string, number>();
  for (const event of pageViewEvents) {
    const path = event.pagePath || (typeof event.properties.path === "string" ? event.properties.path : null);
    if (path) pageCounts.set(path, (pageCounts.get(path) || 0) + 1);
  }

  const sourceNames = new Set<string>(["tiktok", "instagram", "facebook"]);
  for (const event of events) sourceNames.add(normalizeTrafficSource(event.source || undefined));
  const orderSource = (order: AnalyticsOrderMetric) => {
    const touch = order.lastTouch || order.firstTouch;
    return touch?.source ? normalizeTrafficSource(touch.source) : "unattributed";
  };
  for (const order of purchaseOrders) sourceNames.add(orderSource(order));
  const sourceRank = (source: string) => ["tiktok", "instagram", "facebook"].indexOf(source);

  const sources = [...sourceNames].map((source) => {
    const matching = (items: AnalyticsEvent[]) => items.filter((event) => normalizeTrafficSource(event.source || undefined) === source);
    const sourceOrders = purchaseOrders.filter((order) => orderSource(order) === source);
    return {
      source,
      visitors: new Set(matching(pageViewEvents).flatMap((event) => event.visitorId ? [event.visitorId] : [])).size,
      studioStarts: unique(matching(studioEvents)),
      checkoutViews: unique(matching(checkoutViewEvents)),
      stripeCheckoutStarts: new Set(matching(stripeEvents).map((event) => event.orderId || keyFor(event))).size,
      purchases: sourceOrders.length,
      revenueCents: sourceOrders.reduce((sum, order) => sum + revenueFor(order), 0),
    };
  }).filter((row) => row.visitors || row.studioStarts || row.checkoutViews || row.stripeCheckoutStarts || row.purchases || sourceRank(row.source) >= 0)
    .sort((a, b) => {
      const aRank = sourceRank(a.source);
      const bRank = sourceRank(b.source);
      if (aRank >= 0 || bRank >= 0) return (aRank >= 0 ? aRank : 99) - (bRank >= 0 ? bRank : 99);
      return b.visitors - a.visitors;
    });

  const campaignKeys = new Set<string>();
  const campaignParts = (source: string, campaign?: string | null, content?: string | null) => ({
    source: normalizeTrafficSource(source),
    campaign: campaign || "(none)",
    content: content || "(none)",
  });
  for (const event of pageViewEvents) {
    const parts = campaignParts(event.source || "direct", event.campaign, event.content);
    campaignKeys.add(JSON.stringify(parts));
  }
  for (const order of purchaseOrders) {
    const touch = order.lastTouch || order.firstTouch;
    const parts = campaignParts(orderSource(order), touch?.utm_campaign, touch?.utm_content);
    campaignKeys.add(JSON.stringify(parts));
  }

  const campaigns = [...campaignKeys].map((key) => {
    const parts = JSON.parse(key) as { source: string; campaign: string; content: string };
    const matchingViews = pageViewEvents.filter((event) => (
      normalizeTrafficSource(event.source || undefined) === parts.source
      && (event.campaign || "(none)") === parts.campaign
      && (event.content || "(none)") === parts.content
    ));
    const matchingOrders = purchaseOrders.filter((order) => {
      const touch = order.lastTouch || order.firstTouch;
      return orderSource(order) === parts.source
        && (touch?.utm_campaign || "(none)") === parts.campaign
        && (touch?.utm_content || "(none)") === parts.content;
    });
    return {
      ...parts,
      visitors: new Set(matchingViews.flatMap((event) => event.visitorId ? [event.visitorId] : [])).size,
      purchases: matchingOrders.length,
      revenueCents: matchingOrders.reduce((sum, order) => sum + revenueFor(order), 0),
    };
  }).sort((a, b) => b.revenueCents - a.revenueCents || b.purchases - a.purchases || b.visitors - a.visitors).slice(0, 20);

  const uniqueVisitors = visitorIds.size;
  const studioStarts = unique(studioEvents);
  const checkoutViews = unique(checkoutViewEvents);
  const stripeCheckoutStarts = new Set(stripeEvents.map((event) => event.orderId || keyFor(event))).size;
  const purchases = purchaseOrders.length;
  const attributedPurchases = purchaseOrders.filter((order) => Boolean(order.visitorId)).length;
  const abandonment = Math.max(0, stripeCheckoutStarts - attributedPurchases);

  return {
    range,
    since,
    uniqueVisitors,
    sessions: sessionIds.size,
    pageViews: pageViewEvents.length,
    createSongClicks: unique(byName(["create_song_clicked", "hero_cta_clicked"]).filter(attributable)),
    studioStarts,
    checkoutViews,
    stripeCheckoutStarts,
    purchases,
    attributedPurchases,
    revenueCents: purchaseOrders.reduce((sum, order) => sum + revenueFor(order), 0),
    visitorToStudioRate: percent(studioStarts, uniqueVisitors),
    visitorToPurchaseRate: percent(attributedPurchases, uniqueVisitors),
    checkoutConversionRate: percent(attributedPurchases, stripeCheckoutStarts),
    checkoutAbandonment: abandonment,
    checkoutAbandonmentRate: percent(abandonment, stripeCheckoutStarts),
    topPages: [...pageCounts.entries()].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 10),
    sources,
    campaigns,
  };
}

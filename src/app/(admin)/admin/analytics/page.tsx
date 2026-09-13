import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/db/repository";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsDashboard } from "@/types";

const ranges = [
  ["today", "Today"],
  ["7d", "7 days"],
  ["30d", "30 days"],
] as const;

const percent = (value: number, total: number) => total ? `${Math.round((value / total) * 1000) / 10}%` : "—";

function StageValue({ value, visitors }: { value: number; visitors: number }) {
  return <span className="whitespace-nowrap font-medium">{value.toLocaleString()} <span className="text-xs font-normal text-muted">({percent(value, visitors)} per 100)</span></span>;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const requested = (await searchParams).range;
  const range: AnalyticsDashboard["range"] = requested === "today" || requested === "7d" ? requested : "30d";
  const summary = await getAnalyticsSummary(range);

  const cards = [
    ["Unique visitors", summary.uniqueVisitors.toLocaleString(), `${summary.sessions.toLocaleString()} sessions`],
    ["Page views", summary.pageViews.toLocaleString(), `${summary.topPages.length} active pages`],
    ["Studio starts", summary.studioStarts.toLocaleString(), `${summary.visitorToStudioRate}% of visitors`],
    ["Stripe opens", summary.stripeCheckoutStarts.toLocaleString(), `${summary.checkoutViews.toLocaleString()} checkout views`],
    ["Purchases", summary.purchases.toLocaleString(), `${summary.attributedPurchases.toLocaleString()} attributed · ${summary.visitorToPurchaseRate}% of visitors`],
    ["Revenue", formatCurrency(summary.revenueCents, "usd"), `${summary.checkoutConversionRate}% checkout conversion`],
    ["Checkout abandonment", summary.checkoutAbandonment.toLocaleString(), `${summary.checkoutAbandonmentRate}% of Stripe opens`],
  ] as const;

  const funnel = [
    ["Visitors", summary.uniqueVisitors],
    ["Create Song clicks", summary.createSongClicks],
    ["Studio starts", summary.studioStarts],
    ["Checkout views", summary.checkoutViews],
    ["Stripe checkout starts", summary.stripeCheckoutStarts],
    ["Attributed purchases", summary.attributedPurchases],
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Analytics</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Consented acquisition and conversion data joined to webhook-confirmed orders. A browser counts once as a unique visitor even across repeat page views; sessions and page views remain separate. Staff, Preview, fixture, and tagged test traffic are excluded. Vercel Analytics provides the independent cookieless site-traffic view.
          </p>
        </div>
        <nav className="flex rounded-full border border-border bg-surface p-1" aria-label="Analytics date range">
          {ranges.map(([value, label]) => (
            <Link
              key={value}
              href={`/admin/analytics?range=${value}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${range === value ? "bg-navy text-cream" : "text-muted hover:text-navy"}`}
              aria-current={range === value ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, detail]) => (
          <div key={label} className="surface-card p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-3xl text-navy">{value}</p>
            <p className="mt-2 text-xs text-muted">{detail}</p>
          </div>
        ))}
      </div>

      <section className="surface-card overflow-hidden p-5">
        <h2 className="font-display text-2xl text-navy">Conversion funnel</h2>
        <p className="mt-1 text-sm text-muted">Each step shows the number reaching it and the result per 100 unique visitors.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-6">
          {funnel.map(([label, value], index) => {
            const width = summary.uniqueVisitors ? Math.max(8, Math.round((value / summary.uniqueVisitors) * 100)) : 0;
            return (
              <div key={label} className="rounded-2xl border border-border bg-cream/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{index + 1}. {label}</p>
                <p className="mt-2 font-display text-2xl text-navy">{value.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted">{percent(value, summary.uniqueVisitors)} per 100</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream-deep"><div className="h-full rounded-full bg-gold-fill" style={{ width: `${width}%` }} /></div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface-card overflow-hidden p-5">
        <h2 className="font-display text-2xl text-navy">Traffic source performance</h2>
        <p className="mt-1 text-sm text-muted">TikTok, Instagram, and Facebook stay pinned first so paid-social performance is always visible.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr><th className="py-3 pe-4">Source</th><th className="px-3 py-3">Visitors</th><th className="px-3 py-3">Studio starts</th><th className="px-3 py-3">Checkout</th><th className="px-3 py-3">Stripe</th><th className="px-3 py-3">Purchases</th><th className="py-3 ps-3 text-right">Revenue</th></tr>
            </thead>
            <tbody>
              {summary.sources.map((row) => (
                <tr key={row.source} className="border-b border-border/60 last:border-0">
                  <td className="py-4 pe-4 font-semibold capitalize text-navy">{row.source}</td>
                  <td className="px-3 py-4 font-medium">{row.visitors.toLocaleString()}</td>
                  <td className="px-3 py-4"><StageValue value={row.studioStarts} visitors={row.visitors} /></td>
                  <td className="px-3 py-4"><StageValue value={row.checkoutViews} visitors={row.visitors} /></td>
                  <td className="px-3 py-4"><StageValue value={row.stripeCheckoutStarts} visitors={row.visitors} /></td>
                  <td className="px-3 py-4"><StageValue value={row.purchases} visitors={row.visitors} /></td>
                  <td className="py-4 ps-3 text-right font-semibold">{formatCurrency(row.revenueCents, "usd")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="surface-card overflow-hidden p-5">
          <h2 className="font-display text-2xl text-navy">Campaign and creative</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted"><tr><th className="py-3 pe-3">Source / campaign</th><th className="px-3 py-3">Creative</th><th className="px-3 py-3 text-right">Visitors</th><th className="px-3 py-3 text-right">Purchases</th><th className="py-3 ps-3 text-right">Revenue</th></tr></thead>
              <tbody>
                {summary.campaigns.length ? summary.campaigns.map((row) => (
                  <tr key={`${row.source}:${row.campaign}:${row.content}`} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pe-3"><span className="block font-semibold capitalize">{row.source}</span><span className="text-xs text-muted">{row.campaign}</span></td>
                    <td className="px-3 py-3 text-muted">{row.content}</td>
                    <td className="px-3 py-3 text-right">{row.visitors}</td>
                    <td className="px-3 py-3 text-right">{row.purchases}</td>
                    <td className="py-3 ps-3 text-right font-medium">{formatCurrency(row.revenueCents, "usd")}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="py-8 text-center text-muted">Campaign data will appear after attributed visits arrive.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="font-display text-2xl text-navy">Top pages</h2>
          <div className="mt-4 space-y-3">
            {summary.topPages.length ? summary.topPages.map((page) => (
              <div key={page.path} className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 text-sm last:border-0">
                <span className="min-w-0 truncate text-navy">{page.path}</span>
                <span className="shrink-0 font-semibold">{page.views.toLocaleString()} views</span>
              </div>
            )) : <p className="py-6 text-center text-sm text-muted">Page data will appear after consented visits arrive.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

import { getAnalyticsSummary, listAllOrders } from "@/lib/db/repository";
import { formatCurrency } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const [summary, orders] = await Promise.all([getAnalyticsSummary(), listAllOrders()]);

  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const funnel = [
    ["Hero CTA clicks", summary.funnel.heroCta],
    ["Studio started", summary.funnel.studioStarted],
    ["Checkout started", summary.funnel.checkoutStarted],
    ["Purchases completed", summary.funnel.purchaseCompleted],
  ] as const;

  const cards = [
    ["Revenue", formatCurrency(summary.revenueCents, "usd")],
    ["Orders", String(summary.orderCount)],
    ["Active jobs", String(summary.activeJobs)],
    ["Failed jobs", String(summary.failedJobs)],
    ["Open tickets", String(summary.openTickets)],
    ["Revision queue", String(summary.revisionQueue)],
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Analytics</h1>
      <p className="text-muted">
        Sales and product events from the database. Traffic analytics live in the Vercel dashboard.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="surface-card p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="font-display text-2xl">Conversion funnel</h2>
          <div className="mt-3 space-y-2 text-sm">
            {funnel.map(([label, count]) => (
              <div key={label} className="flex items-center justify-between border-b border-border/60 pb-2">
                <span>{label}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="surface-card p-5">
          <h2 className="font-display text-2xl">Orders by status</h2>
          <div className="mt-3 space-y-2 text-sm">
            {Object.keys(byStatus).length === 0 ? (
              <p className="text-muted">No orders yet.</p>
            ) : (
              Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span>{status.replace(/_/g, " ")}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

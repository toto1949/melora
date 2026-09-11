import { getAnalyticsSummary, listAllOrders, listJobs, listTickets, listRevisions } from "@/lib/db/repository";
import { formatCurrency } from "@/lib/utils";

export default async function AdminHome() {
  const [summary, orders, jobs, tickets, revisions] = await Promise.all([
    getAnalyticsSummary(),
    listAllOrders(),
    listJobs(),
    listTickets(),
    listRevisions(),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Operations overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface-card p-4"><p className="text-sm text-muted">Revenue</p><p className="font-display text-3xl">{formatCurrency(summary.revenueCents)}</p></div>
        <div className="surface-card p-4"><p className="text-sm text-muted">Orders</p><p className="font-display text-3xl">{orders.length}</p></div>
        <div className="surface-card p-4"><p className="text-sm text-muted">Active jobs</p><p className="font-display text-3xl">{jobs.filter(j => j.status === "queued" || j.status === "running").length}</p></div>
        <div className="surface-card p-4"><p className="text-sm text-muted">Failed jobs</p><p className="font-display text-3xl">{jobs.filter(j => j.status === "failed" || j.status === "dead_letter").length}</p></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="font-display text-2xl">Conversion funnel</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Visitors: {summary.uniqueVisitors}</li>
            <li>Create Song clicks: {summary.createSongClicks}</li>
            <li>Studio started: {summary.studioStarts}</li>
            <li>Checkout viewed: {summary.checkoutViews}</li>
            <li>Stripe opened: {summary.stripeCheckoutStarts}</li>
            <li>Purchases: {summary.purchases}</li>
          </ul>
        </section>
        <section className="surface-card p-5">
          <h2 className="font-display text-2xl">Queues</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Support open: {tickets.filter(t => t.status === "open").length}</li>
            <li>Revisions: {revisions.filter(r => r.status === "requested").length}</li>
            <li>Jobs queued/running: {jobs.filter(j => j.status === "queued" || j.status === "running").length}</li>
            <li>Newest orders: {orders.slice(0, 3).map(o => o.orderNumber).join(", ") || "—"}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

import { getAnalyticsSummary } from "@/lib/db/repository";
import { getStore } from "@/lib/db/store";

export default async function Page() {
  const store = await getStore();
  const summary = await getAnalyticsSummary();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Generation providers</h1>
      <p className="text-muted">Staff tools for generation providers. Demo data is labeled where applicable.</p>
      <div className="surface-card space-y-2 p-5 text-sm">
        <p>Orders: {store.orders.length}</p>
        <p>Tickets: {store.tickets.length}</p>
        <p>Revisions: {store.revisions.length}</p>
        <p>Coupons: {store.coupons.length}</p>
        <p>Samples: {store.samples.length}</p>
        <p>Reviews: {store.reviews.length}</p>
        <p>Profiles: {store.profiles.length}</p>
        <p>Funnel purchases: {summary.funnel.purchaseCompleted}</p>
        <p>Providers: lyrics/music/video adapters configured via environment variables.</p>
      </div>
    </div>
  );
}

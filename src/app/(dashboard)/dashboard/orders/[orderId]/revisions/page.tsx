import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrder, listRevisions } from "@/lib/db/repository";
import { requestRevisionAction } from "@/lib/actions/orders";
import { REVISION_CATEGORIES } from "@/lib/constants";

export default async function RevisionsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  const order = await getOrder(orderId);
  if (!order || !user || (order.userId && order.userId !== user.id && user.role === "customer")) notFound();
  const revisions = await listRevisions(orderId);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-navy">Revision request</h1>
        <p className="text-muted">Credits remaining: {order.revisionCreditsRemaining}. Previous versions are kept.</p>
      </div>
      <form action={requestRevisionAction.bind(null, orderId)} className="surface-card space-y-4 p-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">What should we change?</legend>
          <div className="grid grid-cols-2 gap-2">
            {REVISION_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="categories" value={cat} />
                {cat}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="timestamps" className="mb-1.5 block text-sm font-medium">Timestamps (optional)</label>
          <input id="timestamps" name="timestamps" className="w-full rounded-2xl border border-border px-4 py-3" placeholder="0:32, 1:10" />
        </div>
        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">Detailed notes</label>
          <textarea id="notes" name="notes" required minLength={10} className="min-h-32 w-full rounded-2xl border border-border px-4 py-3" />
        </div>
        <button type="submit" className="btn-primary" disabled={order.revisionCreditsRemaining <= 0}>Submit revision request</button>
      </form>
      <section className="surface-card p-5">
        <h2 className="font-display text-2xl">Revision history</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {revisions.map((r) => (
            <li key={r.id} className="border-b border-border pb-3">
              <p className="font-semibold">{r.status} · {r.categories.join(", ")}</p>
              <p className="text-muted">{r.notes}</p>
            </li>
          ))}
          {revisions.length === 0 ? <li className="text-muted">No revisions yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}

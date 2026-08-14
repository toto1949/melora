import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrder, listRevisions } from "@/lib/db/repository";
import { requestRevisionAction } from "@/lib/actions/orders";
import { REVISION_CATEGORIES } from "@/lib/constants";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export default async function RevisionsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  const order = await getOrder(orderId);
  if (!order || !user || (order.userId && order.userId !== user.id && user.role === "customer")) notFound();
  const [revisions, messages] = await Promise.all([listRevisions(orderId), getMessages()]);
  const copy = messages.dashboard.revision;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
        <p className="text-muted">{copy.credits.replace("{count}", String(order.revisionCreditsRemaining))}</p>
      </div>
      <form action={requestRevisionAction.bind(null, orderId)} className="surface-card space-y-4 p-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{copy.what}</legend>
          <div className="grid grid-cols-2 gap-2">
            {REVISION_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="categories" value={cat} />
                {copy.categories[cat]}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="timestamps" className="mb-1.5 block text-sm font-medium">{copy.timestamps}</label>
          <input id="timestamps" name="timestamps" className="w-full rounded-2xl border border-border px-4 py-3" placeholder="0:32, 1:10" />
        </div>
        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">{copy.notes}</label>
          <textarea id="notes" name="notes" required minLength={10} className="min-h-32 w-full rounded-2xl border border-border px-4 py-3" />
        </div>
        <SubmitButton label={copy.submit} pendingLabel={copy.submitting} disabled={order.revisionCreditsRemaining <= 0} />
      </form>
      <section className="surface-card p-5">
        <h2 className="font-display text-2xl">{copy.history}</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {revisions.map((r) => (
            <li key={r.id} className="border-b border-border pb-3">
              <p className="font-semibold">{messages.dashboard.revisionStatuses[r.status as keyof typeof messages.dashboard.revisionStatuses] ?? r.status} · {r.categories.map((category: string) => copy.categories[category as keyof typeof copy.categories] ?? category).join(", ")}</p>
              <p className="text-muted">{r.notes}</p>
            </li>
          ))}
          {revisions.length === 0 ? <li className="text-muted">{copy.empty}</li> : null}
        </ul>
      </section>
    </div>
  );
}

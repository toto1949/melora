import { createTicketAction } from "@/lib/actions/support";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ sent?: string; orderId?: string; error?: string }> }) {
  const [{ sent, orderId, error }, messages] = await Promise.all([searchParams, getMessages()]);
  const copy = messages.dashboard.support;
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      {sent ? <p role="status" className="mt-4 max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{copy.sent}</p> : null}
      {error ? <p role="alert" className="mt-4 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Please enter a subject and at least one sentence describing what you need.</p> : null}
      <form action={createTicketAction} className="surface-card mt-6 max-w-xl space-y-4 p-5">
        {orderId ? <input type="hidden" name="orderId" value={orderId} /> : null}
        {orderId ? <p className="rounded-2xl bg-cream px-4 py-3 text-sm text-muted">This request will be attached to order {orderId}.</p> : null}
        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">{copy.subject}</label>
          <input id="subject" name="subject" required className={field} />
        </div>
        <div>
          <label htmlFor="body" className="mb-1.5 block text-sm font-medium">{copy.body}</label>
          <textarea id="body" name="body" required className={field + " min-h-32"} />
        </div>
        <SubmitButton label={copy.send} pendingLabel={copy.sending} />
      </form>
    </div>
  );
}

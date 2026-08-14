import { createTicketAction } from "@/lib/actions/support";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const [{ sent }, messages] = await Promise.all([searchParams, getMessages()]);
  const copy = messages.dashboard.support;
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      {sent ? <p role="status" className="mt-4 max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{copy.sent}</p> : null}
      <form action={createTicketAction} className="surface-card mt-6 max-w-xl space-y-4 p-5">
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

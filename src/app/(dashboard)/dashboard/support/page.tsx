import { createTicketAction } from "@/lib/actions/support";

export default function SupportPage() {
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Support</h1>
      <form action={createTicketAction} className="surface-card mt-6 max-w-xl space-y-4 p-5">
        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">Subject</label>
          <input id="subject" name="subject" required className={field} />
        </div>
        <div>
          <label htmlFor="body" className="mb-1.5 block text-sm font-medium">How can we help?</label>
          <textarea id="body" name="body" required className={field + " min-h-32"} />
        </div>
        <button type="submit" className="btn-primary">Send message</button>
      </form>
    </div>
  );
}

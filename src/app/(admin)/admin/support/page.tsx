import { updateTicketStatusAction } from "@/lib/actions/admin";
import { listTickets } from "@/lib/db/repository";
import { formatDate } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  pending: "bg-blue-100 text-blue-800",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-navy/5 text-muted",
};

export default async function AdminSupportPage() {
  const tickets = await listTickets();
  const open = tickets.filter((t) => t.status === "open").length;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Support queue</h1>
      <p className="text-muted">
        {tickets.length} ticket{tickets.length === 1 ? "" : "s"} total, {open} open.
      </p>
      {tickets.length === 0 ? (
        <div className="surface-card p-6 text-sm text-muted">
          No support tickets yet. Tickets created from the contact form appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{ticket.subject}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[ticket.status] ?? ""}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {ticket.email} · {formatDate(ticket.createdAt)}
                    {ticket.orderId ? ` · order ${ticket.orderId}` : ""}
                  </p>
                  <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm text-muted">{ticket.body}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {ticket.status !== "resolved" ? (
                    <form action={updateTicketStatusAction.bind(null, ticket.id, "resolved")}>
                      <button type="submit" className="btn-secondary px-4 py-2 text-sm">
                        Mark resolved
                      </button>
                    </form>
                  ) : (
                    <form action={updateTicketStatusAction.bind(null, ticket.id, "open")}>
                      <button type="submit" className="btn-secondary px-4 py-2 text-sm">
                        Reopen
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

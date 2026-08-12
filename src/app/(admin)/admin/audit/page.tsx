import { listRecentEvents } from "@/lib/db/repository";
import { formatDate } from "@/lib/utils";

export default async function AdminAuditPage() {
  const events = await listRecentEvents(100);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Activity log</h1>
      <p className="text-muted">The most recent product events, newest first.</p>
      {events.length === 0 ? (
        <div className="surface-card p-6 text-sm text-muted">No events recorded yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="p-3">Event</th>
                <th className="p-3">User</th>
                <th className="p-3">Order</th>
                <th className="p-3">When</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border/70">
                  <td className="p-3 font-mono text-xs">{event.eventName}</td>
                  <td className="p-3 text-xs">{event.userId ?? "—"}</td>
                  <td className="p-3 text-xs">{event.orderId ?? "—"}</td>
                  <td className="p-3 text-xs">{formatDate(event.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

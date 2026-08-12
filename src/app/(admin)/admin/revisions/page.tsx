import { listRevisions } from "@/lib/db/repository";
import { formatDate } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-navy/5 text-muted",
};

export default async function AdminRevisionsPage() {
  const revisions = await listRevisions();
  const queued = revisions.filter((r) => r.status === "requested").length;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Revision queue</h1>
      <p className="text-muted">
        {revisions.length} request{revisions.length === 1 ? "" : "s"} total, {queued} awaiting action.
      </p>
      {revisions.length === 0 ? (
        <div className="surface-card p-6 text-sm text-muted">
          No revision requests yet. Requests customers submit from their order page appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {revisions.map((revision) => (
            <div key={revision.id} className="surface-card p-5">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[revision.status] ?? ""}`}>
                  {revision.status.replace("_", " ")}
                </span>
                <p className="text-xs text-muted">
                  Order {revision.orderId} · {formatDate(revision.createdAt)}
                </p>
              </div>
              {revision.categories.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {revision.categories.map((category: string) => (
                    <span key={category} className="rounded-full bg-navy/5 px-2 py-0.5 text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm text-muted">{revision.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

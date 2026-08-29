"use client";

export function ReviewActions({
  disabled,
  busyAction,
  onApprove,
  onRegenerate,
  onReject,
}: {
  disabled: boolean;
  busyAction: "approve" | "regenerate" | "reject" | null;
  onApprove: () => void;
  onRegenerate: () => void;
  onReject: () => void;
}) {
  return (
    <section className="surface-card p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Human review gate</p>
        <h2 className="mt-1 font-display text-3xl">Decision</h2>
        <p className="mt-2 text-sm text-muted">
          Approval is the only action that can publish. Regenerate returns a new video for review. Reject publishes nothing.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          disabled={disabled || busyAction !== null}
          onClick={onReject}
          className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-navy disabled:opacity-50"
        >
          {busyAction === "reject" ? "Rejecting…" : "Reject"}
        </button>
        <button
          type="button"
          disabled={disabled || busyAction !== null}
          onClick={onRegenerate}
          className="rounded-full border border-navy/20 bg-navy/5 px-5 py-3 text-sm font-semibold text-navy disabled:opacity-50"
        >
          {busyAction === "regenerate" ? "Regenerating…" : "Regenerate"}
        </button>
        <button
          type="button"
          disabled={disabled || busyAction !== null}
          onClick={onApprove}
          className="btn-primary disabled:opacity-50"
        >
          {busyAction === "approve" ? "Publishing…" : "Approve & publish"}
        </button>
      </div>
    </section>
  );
}

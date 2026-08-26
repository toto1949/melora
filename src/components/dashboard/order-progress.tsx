"use client";

import { useEffect, useState } from "react";
import type { JobType, OrderStatus } from "@/types";

const ACTIVE_REFRESH_INTERVAL_MS = 2_000;

interface ProgressSnapshot {
  status: OrderStatus;
  progress: number;
  stage: JobType | null;
}

export function OrderProgress({
  shareToken,
  initialStatus,
  initialProgress,
  statusLabels,
  stageLabels,
}: {
  shareToken: string;
  initialStatus: OrderStatus;
  initialProgress: number;
  statusLabels: Record<OrderStatus, string>;
  stageLabels: Record<JobType, string>;
}) {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>({
    status: initialStatus,
    progress: initialProgress,
    stage: null,
  });
  const terminal = ["ready", "completed", "failed", "refunded"].includes(snapshot.status);

  useEffect(() => {
    if (terminal) return;
    let cancelled = false;
    let timer: number | undefined;
    let controller: AbortController | undefined;

    const poll = async () => {
      controller = new AbortController();
      try {
        const response = await fetch(
          `/api/listen/${encodeURIComponent(shareToken)}/status`,
          { cache: "no-store", signal: controller.signal },
        );
        if (response.ok) {
          const next = (await response.json()) as ProgressSnapshot;
          if (!cancelled) setSnapshot(next);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          // A transient poll failure should not replace the last known progress.
        }
      }

      if (!cancelled) timer = window.setTimeout(poll, ACTIVE_REFRESH_INTERVAL_MS);
    };

    void poll();
    return () => {
      cancelled = true;
      controller?.abort();
      if (timer) window.clearTimeout(timer);
    };
  }, [shareToken, terminal]);

  const progress = Math.min(100, Math.max(0, snapshot.progress));
  const label = snapshot.stage
    ? stageLabels[snapshot.stage]
    : statusLabels[snapshot.status];

  return (
    <div className="mt-1" aria-live="polite">
      <p className="text-sm text-muted">{label} · {progress}%</p>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-cream-deep"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-fill to-gold-fill transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { sendAnalyticsEvent, trackExternalEvent } from "@/lib/analytics/client";

export function CheckoutViewTracker({ projectId }: { projectId: string }) {
  useEffect(() => {
    const key = `mtm-checkout-view-${projectId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch { /* event remains best effort */ }
    sendAnalyticsEvent("checkout_viewed", { path: location.pathname }, projectId);
    trackExternalEvent("view_checkout", { page_path: location.pathname });
  }, [projectId]);
  return null;
}

export function StudioProgressTracker({ projectId, step }: { projectId: string; step: number }) {
  useEffect(() => {
    const key = `mtm-studio-progress-${projectId}-${step}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch { /* event remains best effort */ }
    if (step === 1) trackExternalEvent("studio_started");
    trackExternalEvent("studio_progress", { step });
  }, [projectId, step]);
  return null;
}

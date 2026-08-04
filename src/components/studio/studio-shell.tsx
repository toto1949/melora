"use client";

import Link from "next/link";
import { STUDIO_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StudioShell({
  projectId,
  currentStep,
  children,
}: {
  projectId: string;
  currentStep: number;
  children: React.ReactNode;
}) {
  const progress = Math.round((currentStep / STUDIO_STEPS.length) * 100);
  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="font-display text-xl text-navy">
            Melora Studio
          </Link>
          <p className="text-sm text-muted">About {Math.max(1, 6 - currentStep)} min left · Autosaves</p>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-4">
          <div
            className="h-2 overflow-hidden rounded-full bg-cream-deep"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Studio progress"
          >
            <div className="h-full rounded-full bg-gradient-to-r from-rose to-gold transition-all" style={{ width: `${progress}%` }} />
          </div>
          <ol className="mt-3 flex gap-2 overflow-x-auto text-xs">
            {STUDIO_STEPS.map((step) => (
              <li key={step.key}>
                <Link
                  href={`/studio/${projectId}/${step.path}`}
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 whitespace-nowrap",
                    step.step <= currentStep ? "bg-navy text-cream" : "bg-cream-deep text-muted",
                  )}
                >
                  {step.step}. {step.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">{children}</div>
    </div>
  );
}

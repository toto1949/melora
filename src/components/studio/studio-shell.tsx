"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
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
      <div className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
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
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-rose to-gold"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            />
          </div>
          <ol className="mt-3 flex gap-2 overflow-x-auto pb-1 text-xs">
            {STUDIO_STEPS.map((step) => {
              const isDone = step.step < currentStep;
              const isCurrent = step.step === currentStep;
              const pill = cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 whitespace-nowrap transition",
                isCurrent
                  ? "bg-navy text-cream shadow-sm"
                  : isDone
                    ? "bg-gold/20 text-navy hover:bg-gold/35"
                    : "bg-cream-deep text-muted",
              );
              return (
                <li key={step.key}>
                  {isDone ? (
                    <Link href={`/studio/${projectId}/${step.path}`} className={pill}>
                      <Check className="h-3 w-3" strokeWidth={3} />
                      {step.title}
                    </Link>
                  ) : (
                    <span className={pill} aria-current={isCurrent ? "step" : undefined}>
                      {isCurrent ? null : <span className="opacity-60">{step.step}.</span>}
                      {step.title}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">{children}</div>
    </div>
  );
}

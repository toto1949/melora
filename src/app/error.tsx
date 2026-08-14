"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocale } from "@/components/i18n/locale-provider";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { messages } = useLocale();
  const copy = messages.common;

  useEffect(() => {
    console.error("Route error", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="surface-card max-w-lg p-8 text-center" role="alert">
        <h1 className="font-display text-3xl text-navy">{copy.errorTitle}</h1>
        <p className="mt-3 prose-muted">{copy.errorBody}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary" onClick={reset}>{copy.retry}</button>
          <Link href="/" className="btn-secondary">{copy.home}</Link>
        </div>
      </div>
    </div>
  );
}

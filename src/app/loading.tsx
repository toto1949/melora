"use client";

import { useLocale } from "@/components/i18n/locale-provider";

export default function Loading() {
  const { messages } = useLocale();
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4" role="status" aria-live="polite">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gold-fill/35 border-t-gold" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium text-muted">{messages.common.loading}</p>
      </div>
    </div>
  );
}

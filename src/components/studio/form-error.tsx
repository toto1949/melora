"use client";

import { useLocale } from "@/components/i18n/locale-provider";

export function FormError({ message }: { message?: string | null }) {
  const { locale, messages } = useLocale();
  if (!message) return null;
  return (
    <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {locale === "en" ? message : messages.common.formError}
    </p>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { COOKIE_CONSENT, type CookieConsentValue } from "@/lib/cookie-consent";

export function CookieConsent({ initialConsent }: { initialConsent: CookieConsentValue | null }) {
  const [visible, setVisible] = useState(initialConsent === null);
  const { messages } = useLocale();
  const router = useRouter();
  const copy = messages.cookie;

  if (!visible) return null;

  const choose = (value: "all" | "essential") => {
    document.cookie = `${COOKIE_CONSENT}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    setVisible(false);
    router.refresh();
  };

  return (
    <div
      role="region"
      aria-label={copy.aria}
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-lift)] sm:inset-x-auto sm:end-5 sm:bottom-5 sm:max-w-sm"
    >
      <p className="text-sm font-semibold text-navy">{copy.title}</p>
      <p className="mt-2 text-sm prose-muted">
        {copy.body}{" "}
        <Link href="/legal/privacy" className="underline">
          {copy.privacy}
        </Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn-secondary !px-3 !py-2 text-sm"
          onClick={() => choose("all")}
        >
          {copy.accept}
        </button>
        <button
          type="button"
          className="btn-secondary !px-3 !py-2 text-sm"
          onClick={() => choose("essential")}
        >
          {copy.essential}
        </button>
      </div>
    </div>
  );
}

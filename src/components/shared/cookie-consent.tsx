"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/i18n/locale-provider";

const KEY = "melora_cookie_prefs";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { messages } = useLocale();
  const copy = messages.cookie;

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={copy.aria}
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-lift)]"
    >
      <p className="font-display text-xl text-navy">{copy.title}</p>
      <p className="mt-2 text-sm prose-muted">
        {copy.body}{" "}
        <Link href="/legal/privacy" className="underline">
          {copy.privacy}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary !py-2"
          onClick={() => {
            localStorage.setItem(KEY, JSON.stringify({ essential: true, analytics: true }));
            setVisible(false);
          }}
        >
          {copy.accept}
        </button>
        <button
          type="button"
          className="btn-secondary !py-2"
          onClick={() => {
            localStorage.setItem(KEY, JSON.stringify({ essential: true, analytics: false }));
            setVisible(false);
          }}
        >
          {copy.essential}
        </button>
      </div>
    </div>
  );
}

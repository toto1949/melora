"use client";

import { useRef, useTransition } from "react";
import { LANGUAGES } from "@/lib/constants";
import { setLocaleAction } from "@/lib/actions/locale";

export function LocaleSwitcher({
  current,
  label,
  names,
}: {
  current: string;
  label: string;
  names: Record<string, string>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form ref={formRef} action={setLocaleAction}>
      <label className="block text-xs text-cream/60" htmlFor="footer-lang">
        {label}
      </label>
      <select
        id="footer-lang"
        name="locale"
        defaultValue={current}
        disabled={isPending}
        onChange={() => startTransition(() => formRef.current?.requestSubmit())}
        className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="text-navy">
            {names[l.code] ?? l.name}
          </option>
        ))}
      </select>
    </form>
  );
}

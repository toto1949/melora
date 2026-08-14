"use client";

import { useActionState } from "react";
import { signInAction, signUpAction, type AuthState } from "@/lib/actions/auth";
import { useLocale } from "@/components/i18n/locale-provider";

const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";

function ErrorNote({ message, fallback, useFallback }: { message?: string; fallback: string; useFallback: boolean }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {useFallback ? fallback : message}
    </p>
  );
}

export function SignInForm() {
  const { locale, messages } = useLocale();
  const copy = messages.auth;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signInAction, null);
  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">{copy.email}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">{copy.password}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} className={field} />
      </div>
      <ErrorNote message={state?.error} fallback={copy.genericError} useFallback={locale !== "en"} />
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? copy.signingIn : copy.signIn}
      </button>
    </form>
  );
}

export function SignUpForm() {
  const { locale, messages } = useLocale();
  const copy = messages.auth;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signUpAction, null);
  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">{copy.name}</label>
        <input id="name" name="name" autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">{copy.email}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">{copy.password}</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder={copy.passwordHint} className={field} />
      </div>
      <ErrorNote message={state?.error} fallback={copy.genericError} useFallback={locale !== "en"} />
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? copy.creating : copy.createAccount}
      </button>
    </form>
  );
}

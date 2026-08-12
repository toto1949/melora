"use client";

import { useActionState } from "react";
import { signInAction, signUpAction, type AuthState } from "@/lib/actions/auth";

const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";

function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </p>
  );
}

export function SignInForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signInAction, null);
  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} className={field} />
      </div>
      <ErrorNote message={state?.error} />
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signUpAction, null);
  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name</label>
        <input id="name" name="name" autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" className={field} />
      </div>
      <ErrorNote message={state?.error} />
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

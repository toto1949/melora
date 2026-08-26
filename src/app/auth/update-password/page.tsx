"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePasswordAction } from "@/lib/actions/auth";

export default function UpdatePasswordPage() {
  const [state, action, pending] = useActionState(updatePasswordAction, null);
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl text-navy">Choose a new password</h1>
        <p className="mt-3 text-sm text-muted">Use at least eight characters. This link can only be used by the person who received the recovery email.</p>
        <form action={action} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">New password</label>
            <input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" className="w-full rounded-2xl border border-border bg-surface px-4 py-3" />
          </div>
          <div>
            <label htmlFor="confirmation" className="mb-1.5 block text-sm font-medium">Confirm new password</label>
            <input id="confirmation" name="confirmation" type="password" minLength={8} required autoComplete="new-password" className="w-full rounded-2xl border border-border bg-surface px-4 py-3" />
          </div>
          {state?.error ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}
          <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">{pending ? "Updating password…" : "Update password"}</button>
        </form>
        <Link href="/auth/sign-in" className="mt-5 block text-center text-sm font-semibold text-rose underline">Back to sign in</Link>
      </div>
    </div>
  );
}

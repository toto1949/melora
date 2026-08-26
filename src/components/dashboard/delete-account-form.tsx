"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction } from "@/lib/actions/account";

export function DeleteAccountForm({ prompt, label, pendingLabel }: { prompt: string; label: string; pendingLabel: string }) {
  const [state, action, pending] = useActionState(deleteAccountAction, null);
  const [confirmation, setConfirmation] = useState("");
  return (
    <form action={action} className="space-y-3 border-t border-border pt-4">
      <p className="text-sm text-muted">{prompt}</p>
      <label htmlFor="delete-confirmation" className="sr-only">Type DELETE to confirm</label>
      <input id="delete-confirmation" name="confirm" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="DELETE" autoComplete="off" className="w-full max-w-xs rounded-2xl border border-border px-4 py-3" />
      {state?.error ? <p role="alert" className="text-sm text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending || confirmation !== "DELETE"} onClick={(event) => { if (!window.confirm("Permanently delete your account and sign out?")) event.preventDefault(); }} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50">{pending ? pendingLabel : label}</button>
    </form>
  );
}

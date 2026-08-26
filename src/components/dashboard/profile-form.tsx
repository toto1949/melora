"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/account";

export function ProfileForm({ fullName, phone, marketingOptIn, trainingOptIn }: { fullName: string | null; phone: string | null; marketingOptIn: boolean; trainingOptIn: boolean }) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <form action={action} className="surface-card space-y-4 p-5">
      <h2 className="font-display text-2xl">Profile details</h2>
      <div><label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">Name</label><input id="fullName" name="fullName" defaultValue={fullName ?? ""} maxLength={100} autoComplete="name" className={field} /></div>
      <div><label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Phone</label><input id="phone" name="phone" type="tel" defaultValue={phone ?? ""} maxLength={30} autoComplete="tel" className={field} /></div>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="marketingOptIn" defaultChecked={marketingOptIn} className="mt-1" /><span>Send me occasional product news and gift ideas.</span></label>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="trainingOptIn" defaultChecked={trainingOptIn} className="mt-1" /><span>Allow de-identified content to improve the service. Off by default.</span></label>
      {state?.error ? <p role="alert" className="text-sm text-red-700">{state.error}</p> : null}
      {state?.success ? <p role="status" className="text-sm text-emerald-700">Profile saved.</p> : null}
      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving…" : "Save profile"}</button>
    </form>
  );
}

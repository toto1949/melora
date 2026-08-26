"use client";

import { useActionState, useState } from "react";
import { updatePrivacyAction } from "@/lib/actions/listen";
import { SubmitButton } from "@/components/studio/submit-button";

type Copy = {
  privacyTitle: string; private: string; password: string; unlisted: string; public: string;
  gift: string; sharePassword: string; passwordHint: string; save: string; saving: string;
};

export function PrivacySettings({ orderId, initialMode, giftRevealEnabled, copy }: { orderId: string; initialMode: "private" | "password" | "unlisted" | "public"; giftRevealEnabled: boolean; copy: Copy }) {
  const [mode, setMode] = useState(initialMode);
  const [state, action] = useActionState(updatePrivacyAction.bind(null, orderId), null);
  return (
    <form action={action} className="surface-card space-y-3 p-5">
      <h2 className="font-display text-2xl">{copy.privacyTitle}</h2>
      <label htmlFor="privacyMode" className="sr-only">{copy.privacyTitle}</label>
      <select id="privacyMode" name="privacyMode" value={mode} onChange={(event) => setMode(event.target.value as typeof mode)} className="w-full rounded-2xl border border-border px-4 py-3">
        <option value="private">{copy.private}</option><option value="password">{copy.password}</option><option value="unlisted">{copy.unlisted}</option><option value="public">{copy.public}</option>
      </select>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="giftRevealEnabled" defaultChecked={giftRevealEnabled} />{copy.gift}</label>
      {mode === "password" ? (
        <div>
          <label htmlFor="sharePassword" className="mb-1.5 block text-sm font-medium">{copy.sharePassword}</label>
          <input id="sharePassword" name="sharePassword" type="password" minLength={4} required autoComplete="new-password" placeholder={copy.passwordHint} className="w-full rounded-2xl border border-border px-4 py-3" />
        </div>
      ) : null}
      {state?.error ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}
      <SubmitButton label={copy.save} pendingLabel={copy.saving} />
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { checkoutAction, type CheckoutState } from "@/lib/actions/studio";
import { formatCurrency } from "@/lib/utils";

interface PackageOption {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  defaultChecked: boolean;
}

interface AddOnOption {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
}

interface CheckoutFormProps {
  projectId: string;
  idempotencyKey: string;
  packages: PackageOption[];
  addOns: AddOnOption[];
  userEmail: string | null;
  isLoggedIn: boolean;
}

const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";

export function CheckoutForm({ projectId, idempotencyKey, packages, addOns, userEmail, isLoggedIn }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(
    checkoutAction.bind(null, projectId),
    null,
  );
  const [createAccount, setCreateAccount] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Package</legend>
        <div className="space-y-3">
          {packages.map((pkg) => (
            <label key={pkg.id} className="surface-card flex cursor-pointer items-start gap-3 p-4 has-[:checked]:ring-2 has-[:checked]:ring-gold">
              <input type="radio" name="packageId" value={pkg.id} required defaultChecked={pkg.defaultChecked} className="mt-1" />
              <span>
                <span className="block font-display text-xl">{pkg.name} · {formatCurrency(pkg.priceCents, pkg.currency)}</span>
                <span className="text-sm text-muted">{pkg.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Add-ons</legend>
        <div className="space-y-2">
          {addOns.map((addon) => (
            <label key={addon.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
              <input type="checkbox" name="addOnIds" value={addon.id} />
              {addon.name} · {formatCurrency(addon.priceCents, addon.currency)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="deliverySpeed">Delivery speed</label>
          <select id="deliverySpeed" name="deliverySpeed" className={field} defaultValue="standard">
            <option value="standard">Standard</option>
            <option value="rush">Rush</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="couponCode">Coupon</label>
          <input id="couponCode" name="couponCode" className={field} placeholder="WELCOME10" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required defaultValue={userEmail || ""} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="phone">Phone (optional)</label>
          <input id="phone" name="phone" className={field} />
        </div>
      </div>
      {!isLoggedIn ? (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="createAccount"
              checked={createAccount}
              onChange={(e) => setCreateAccount(e.target.checked)}
            />
            Create a Melora account to manage songs and revisions
          </label>
          {createAccount ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="password">Account password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={field}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="termsAccepted" required className="mt-1" />
        <span>
          I agree to the <Link href="/legal/terms" className="underline">Terms</Link> and{" "}
          <Link href="/legal/refunds" className="underline">Refund policy</Link>. Revision credits depend on the selected package.
        </span>
      </label>
      {state?.error ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Link href={`/studio/${projectId}/review`} className="btn-secondary">Back</Link>
        <button type="submit" disabled={pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Redirecting to Stripe…" : "Pay securely"}
        </button>
      </div>
    </form>
  );
}

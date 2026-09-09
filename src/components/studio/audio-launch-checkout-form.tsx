"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { checkoutAction, type CheckoutState } from "@/lib/actions/studio";
import { formatCurrency } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

interface AudioLaunchCheckoutFormProps {
  projectId: string;
  idempotencyKey: string;
  pkg: {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    currency: string;
    revisionCredits: number;
    deliveryHours: number;
  };
  userEmail: string | null;
  isLoggedIn: boolean;
}

const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";

export function AudioLaunchCheckoutForm({
  projectId,
  idempotencyKey,
  pkg,
  userEmail,
  isLoggedIn,
}: AudioLaunchCheckoutFormProps) {
  const { locale, messages } = useLocale();
  const copy = messages.studio.checkout;
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(
    checkoutAction.bind(null, projectId),
    null,
  );
  const [createAccount, setCreateAccount] = useState(false);

  return (
    <form action={formAction} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="packageId" value={pkg.id} />
      <input type="hidden" name="deliverySpeed" value="standard" />
      <input type="hidden" name="couponCode" value="" />

      <div className="space-y-6">
        <div className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose">Launch offer</p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl text-navy">{pkg.name}</h2>
            <span className="font-display text-3xl text-navy">{formatCurrency(pkg.priceCents, pkg.currency, locale)}</span>
          </div>
          <p className="mt-2 text-sm text-muted">{pkg.description}</p>
          <p className="mt-3 text-xs font-medium text-navy">Usually ready within a few minutes · {pkg.revisionCredits} guided revision</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="email">{copy.email}</label>
            <input id="email" name="email" type="email" required defaultValue={userEmail || ""} autoComplete="email" className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="phone">{copy.phone}</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" className={field} />
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="createAccount" checked={createAccount} onChange={(event) => setCreateAccount(event.target.checked)} />
              {copy.createAccount}
            </label>
            {createAccount ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="password">{copy.password}</label>
                <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder={copy.passwordHint} className={field} />
              </div>
            ) : null}
          </div>
        ) : null}

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="termsAccepted" required className="mt-1" />
          <span>
            {copy.termsPrefix} <Link href="/legal/terms" className="underline">{copy.terms}</Link> {copy.and}{" "}
            <Link href="/legal/refunds" className="underline">{copy.refunds}</Link>. Your $19 launch order includes one guided revision.
          </span>
        </label>

        {state?.error ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {locale === "en" ? state.error : copy.genericError}
          </p>
        ) : null}
      </div>

      <aside className="surface-card space-y-4 p-5 lg:sticky lg:top-24" aria-labelledby="order-summary-title">
        <h2 id="order-summary-title" className="font-display text-2xl text-navy">{copy.summary}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-3"><span>{copy.subtotal}</span><span>{formatCurrency(pkg.priceCents, pkg.currency, locale)}</span></div>
          <div className="border-t border-border pt-3 text-base font-bold text-navy">
            <div className="flex justify-between gap-3"><span>{copy.total}</span><span>{formatCurrency(pkg.priceCents, pkg.currency, locale)}</span></div>
          </div>
        </div>
        <p className="rounded-2xl bg-cream px-3 py-2 text-xs text-muted">Creation starts immediately after payment · usually ready within a few minutes</p>
        <ul className="space-y-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-muted">
          <li>✓ One-time payment — no subscription</li>
          <li>✓ One complete personalized audio song</li>
          <li>✓ One guided revision</li>
          <li>✓ Private listening page and MP3 download</li>
          <li>✓ Secure checkout powered by Stripe</li>
        </ul>
        <button type="submit" disabled={pending} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? copy.redirecting : copy.pay}
        </button>
      </aside>
    </form>
  );
}

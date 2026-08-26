"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { applyCouponAction, checkoutAction, type CheckoutState } from "@/lib/actions/studio";
import { formatCurrency } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

interface PackageOption {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  revisionCredits: number;
  deliveryHours: number;
  defaultChecked: boolean;
}

interface AddOnOption {
  id: string;
  slug: string;
  name: string;
  description: string;
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

type AppliedCoupon = {
  code: string;
  percentOff: number | null;
  amountOffCents: number | null;
};

const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";

export function CheckoutForm({ projectId, idempotencyKey, packages, addOns, userEmail, isLoggedIn }: CheckoutFormProps) {
  const { locale, messages } = useLocale();
  const copy = messages.studio.checkout;
  const initialPackage = packages.find((pkg) => pkg.defaultChecked) ?? packages[0];
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(
    checkoutAction.bind(null, projectId),
    null,
  );
  const [createAccount, setCreateAccount] = useState(false);
  const [packageId, setPackageId] = useState(initialPackage?.id ?? "");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [applyingCoupon, startCouponTransition] = useTransition();

  const selectedPackage = packages.find((pkg) => pkg.id === packageId) ?? initialPackage;
  const selectedOptions = addOns.filter((addon) => selectedAddOns.includes(addon.id));
  const isRush = selectedOptions.some((addon) => addon.slug === "rush-delivery");
  const totals = useMemo(() => {
    const subtotal = (selectedPackage?.priceCents ?? 0) + selectedOptions.reduce((sum, addon) => sum + addon.priceCents, 0);
    const percentDiscount = coupon?.percentOff ? Math.round((subtotal * coupon.percentOff) / 100) : 0;
    const fixedDiscount = coupon?.amountOffCents ? Math.min(subtotal, coupon.amountOffCents) : 0;
    const discount = Math.max(percentDiscount, fixedDiscount);
    const tax = Math.round((subtotal - discount) * 0.08);
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  }, [coupon, selectedOptions, selectedPackage]);

  function toggleAddOn(id: string) {
    setSelectedAddOns((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function applyCoupon() {
    const code = couponCode.trim();
    if (!code) {
      setCoupon(null);
      setCouponMessage(copy.couponInvalid);
      return;
    }
    startCouponTransition(async () => {
      const result = await applyCouponAction(code);
      if (!result.ok) {
        setCoupon(null);
        setCouponMessage(copy.couponInvalid);
        return;
      }
      setCoupon(result.coupon);
      setCouponCode(result.coupon.code);
      setCouponMessage(copy.couponApplied.replace("{code}", result.coupon.code));
    });
  }

  return (
    <form action={formAction} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="deliverySpeed" value={isRush ? "rush" : "standard"} />
      <input type="hidden" name="couponCode" value={coupon?.code ?? ""} />
      <div className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{copy.package}</legend>
          <div className="space-y-3">
            {packages.map((pkg) => {
              const localized = messages.pricing.packages[pkg.slug as keyof typeof messages.pricing.packages];
              return (
                <label key={pkg.id} className="surface-card flex cursor-pointer items-start gap-3 p-4 has-[:checked]:ring-2 has-[:checked]:ring-gold">
                  <input type="radio" name="packageId" value={pkg.id} required checked={packageId === pkg.id} onChange={() => setPackageId(pkg.id)} className="mt-1" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-display text-xl">{localized?.name ?? pkg.name}</span>
                      <span className="font-semibold">{formatCurrency(pkg.priceCents, pkg.currency, locale)}</span>
                    </span>
                    <span className="mt-1 block text-sm text-muted">{localized?.description ?? pkg.description}</span>
                    <span className="mt-2 block text-xs font-medium text-navy">{pkg.deliveryHours}h · {pkg.revisionCredits} {copy.revisions}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{copy.addOns}</legend>
          <div className="space-y-2">
            {addOns.map((addon) => (
              <label key={addon.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm has-[:checked]:ring-2 has-[:checked]:ring-gold">
                <input type="checkbox" name="addOnIds" value={addon.id} checked={selectedAddOns.includes(addon.id)} onChange={() => toggleAddOn(addon.id)} className="mt-1" />
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-3 font-semibold"><span>{copy.addOnItems[addon.slug as keyof typeof copy.addOnItems]?.name ?? addon.name}</span><span>{formatCurrency(addon.priceCents, addon.currency, locale)}</span></span>
                  <span className="mt-1 block text-muted">{copy.addOnItems[addon.slug as keyof typeof copy.addOnItems]?.description ?? addon.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="couponInput">{copy.coupon}</label>
          <div className="flex gap-2">
            <input
              id="couponInput"
              value={couponCode}
              onChange={(event) => {
                setCouponCode(event.target.value);
                if (coupon && event.target.value !== coupon.code) setCoupon(null);
                setCouponMessage(null);
              }}
              className={field}
              placeholder={copy.couponHint}
              autoComplete="off"
            />
            <button type="button" onClick={applyCoupon} disabled={applyingCoupon} className="btn-secondary shrink-0 disabled:opacity-60">
              {applyingCoupon ? copy.applying : copy.apply}
            </button>
          </div>
          {couponMessage ? <p role="status" className={`mt-2 text-sm ${coupon ? "text-emerald-700" : "text-red-700"}`}>{couponMessage}</p> : null}
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
            <Link href="/legal/refunds" className="underline">{copy.refunds}</Link>. {copy.termsSuffix}
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
          <div className="flex justify-between gap-3"><span>{copy.subtotal}</span><span>{formatCurrency(totals.subtotal, selectedPackage?.currency, locale)}</span></div>
          {totals.discount ? <div className="flex justify-between gap-3 text-emerald-700"><span>{copy.discount}</span><span>−{formatCurrency(totals.discount, selectedPackage?.currency, locale)}</span></div> : null}
          <div className="flex justify-between gap-3"><span>{copy.estimatedTax}</span><span>{formatCurrency(totals.tax, selectedPackage?.currency, locale)}</span></div>
          <div className="border-t border-border pt-3 text-base font-bold text-navy"><div className="flex justify-between gap-3"><span>{copy.total}</span><span>{formatCurrency(totals.total, selectedPackage?.currency, locale)}</span></div></div>
        </div>
        <p className="rounded-2xl bg-cream px-3 py-2 text-xs text-muted">
          {copy.delivery}: {isRush ? copy.rushDelivery : copy.standardDelivery} · {isRush ? Math.max(6, Math.floor((selectedPackage?.deliveryHours ?? 0) / 2)) : selectedPackage?.deliveryHours}h
        </p>
        <ul className="space-y-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-muted">
          <li>✓ One-time payment — no subscription</li>
          <li>✓ {selectedPackage?.revisionCredits ?? 0} guided revision credit(s)</li>
          <li>✓ Private listening page and MP3 download</li>
          <li>✓ Secure checkout powered by Stripe</li>
        </ul>
        <div className="flex flex-col gap-3">
          <button type="submit" disabled={pending || !selectedPackage} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? copy.redirecting : copy.pay}
          </button>
          <Link href={`/studio/${projectId}/review`} className="btn-secondary w-full text-center">{messages.common.back}</Link>
        </div>
      </aside>
    </form>
  );
}

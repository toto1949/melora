import Link from "next/link";
import { nanoid } from "nanoid";
import { StudioShell } from "@/components/studio/studio-shell";
import { checkoutAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import { listAddOns, listPackages } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/utils";

export default async function CheckoutStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await loadStudioProject(projectId);
  const [packages, addOns, user] = await Promise.all([listPackages(), listAddOns(), getCurrentUser()]);
  const idempotencyKey = nanoid(24);
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <StudioShell projectId={projectId} currentStep={8}>
      <h1 className="font-display text-4xl text-navy">Checkout</h1>
      <p className="mt-3 prose-muted">Secure Stripe Checkout · Clear refund and revision policies · Duplicate submissions prevented</p>
      <form action={checkoutAction.bind(null, projectId)} className="mt-8 space-y-6">
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Package</legend>
          <div className="space-y-3">
            {packages.map((pkg) => (
              <label key={pkg.id} className="surface-card flex cursor-pointer items-start gap-3 p-4 has-[:checked]:ring-2 has-[:checked]:ring-gold">
                <input type="radio" name="packageId" value={pkg.id} required defaultChecked={project.packageId === pkg.id || pkg.slug === "premium-story"} className="mt-1" />
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
            <input id="email" name="email" type="email" required defaultValue={user?.email || ""} className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="phone">Phone (optional)</label>
            <input id="phone" name="phone" className={field} />
          </div>
        </div>
        {!user ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="createAccount" defaultChecked />
            Create a Melora account to manage songs and revisions
          </label>
        ) : null}
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="termsAccepted" required className="mt-1" />
          <span>
            I agree to the <Link href="/legal/terms" className="underline">Terms</Link> and{" "}
            <Link href="/legal/refunds" className="underline">Refund policy</Link>. Revision credits depend on the selected package.
          </span>
        </label>
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/review`} className="btn-secondary">Back</Link>
          <button type="submit" className="btn-primary">Pay securely</button>
        </div>
      </form>
    </StudioShell>
  );
}

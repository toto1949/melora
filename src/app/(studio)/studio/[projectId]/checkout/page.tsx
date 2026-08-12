import { nanoid } from "nanoid";
import { StudioShell } from "@/components/studio/studio-shell";
import { CheckoutForm } from "@/components/studio/checkout-form";
import { loadStudioProject } from "@/lib/studio/load-project";
import { listAddOns, listPackages } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CheckoutStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await loadStudioProject(projectId);
  const [packages, addOns, user] = await Promise.all([listPackages(), listAddOns(), getCurrentUser()]);
  const idempotencyKey = nanoid(24);
  return (
    <StudioShell projectId={projectId} currentStep={8}>
      <h1 className="font-display text-4xl text-navy">Checkout</h1>
      <p className="mt-3 prose-muted">Secure Stripe Checkout · Clear refund and revision policies · Duplicate submissions prevented</p>
      <CheckoutForm
        projectId={projectId}
        idempotencyKey={idempotencyKey}
        packages={packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          priceCents: pkg.priceCents,
          currency: pkg.currency,
          defaultChecked: project.packageId === pkg.id || pkg.slug === "premium-story",
        }))}
        addOns={addOns.map((addon) => ({
          id: addon.id,
          name: addon.name,
          priceCents: addon.priceCents,
          currency: addon.currency,
        }))}
        userEmail={user?.email ?? null}
        isLoggedIn={Boolean(user)}
      />
    </StudioShell>
  );
}

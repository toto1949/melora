import { nanoid } from "nanoid";
import { StudioShell } from "@/components/studio/studio-shell";
import { CheckoutForm } from "@/components/studio/checkout-form";
import { loadStudioProject } from "@/lib/studio/load-project";
import { listAddOns, listPackages } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";
import { filterPackagesForRelease } from "@/lib/features";

export default async function CheckoutStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await loadStudioProject(projectId);
  const [allPackages, addOns, user] = await Promise.all([listPackages(), listAddOns(), getCurrentUser()]);
  const packages = filterPackagesForRelease(allPackages, getEnv().VIDEO_FEATURE_ENABLED);
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
          defaultChecked: project.packageId === pkg.id || pkg.slug === "essential-song",
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

import { nanoid } from "nanoid";
import { StudioShell } from "@/components/studio/studio-shell";
import { CheckoutForm } from "@/components/studio/checkout-form";
import { loadStudioProject } from "@/lib/studio/load-project";
import { listAddOns, listPackages } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";
import { filterPackagesForRelease } from "@/lib/features";
import { getMessages } from "@/lib/i18n";

export default async function CheckoutStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await loadStudioProject(projectId);
  const [allPackages, allAddOns, user, messages] = await Promise.all([listPackages(), listAddOns(), getCurrentUser(), getMessages()]);
  const packages = filterPackagesForRelease(allPackages, getEnv().VIDEO_FEATURE_ENABLED);
  const addOns = allAddOns.filter((addOn) => addOn.slug === "rush-delivery");
  const selectedPackageId = packages.some((pkg) => pkg.id === project.packageId)
    ? project.packageId
    : packages.find((pkg) => pkg.slug === "essential-song")?.id ?? packages[0]?.id;
  const idempotencyKey = nanoid(24);
  return (
    <StudioShell projectId={projectId} currentStep={8}>
      <h1 className="font-display text-4xl text-navy">{messages.studio.checkout.title}</h1>
      <p className="mt-3 prose-muted">{messages.studio.checkout.body}</p>
      <CheckoutForm
        projectId={projectId}
        idempotencyKey={idempotencyKey}
        packages={packages.map((pkg) => ({
          id: pkg.id,
          slug: pkg.slug,
          name: pkg.name,
          description: pkg.description,
          priceCents: pkg.priceCents,
          currency: pkg.currency,
          revisionCredits: pkg.revisionCredits,
          deliveryHours: pkg.deliveryHours,
          defaultChecked: selectedPackageId === pkg.id,
        }))}
        addOns={addOns.map((addon) => ({
          id: addon.id,
          slug: addon.slug,
          name: addon.name,
          description: addon.description,
          priceCents: addon.priceCents,
          currency: addon.currency,
        }))}
        userEmail={user?.email ?? null}
        isLoggedIn={Boolean(user)}
      />
    </StudioShell>
  );
}

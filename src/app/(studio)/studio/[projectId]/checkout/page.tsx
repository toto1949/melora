import { nanoid } from "nanoid";
import { StudioShell } from "@/components/studio/studio-shell";
import { AudioLaunchCheckoutForm } from "@/components/studio/audio-launch-checkout-form";
import { loadStudioProject } from "@/lib/studio/load-project";
import { listPackages } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";
import { filterPackagesForRelease } from "@/lib/features";
import { getMessages } from "@/lib/i18n";

export default async function CheckoutStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  await loadStudioProject(projectId);
  const [allPackages, user, messages] = await Promise.all([listPackages(), getCurrentUser(), getMessages()]);
  const pkg = filterPackagesForRelease(allPackages, getEnv().VIDEO_FEATURE_ENABLED)[0];
  const idempotencyKey = nanoid(24);

  return (
    <StudioShell projectId={projectId} currentStep={7}>
      <h1 className="font-display text-4xl text-navy">{messages.studio.checkout.title}</h1>
      <p className="mt-3 prose-muted">{messages.studio.checkout.body}</p>
      {pkg ? (
        <AudioLaunchCheckoutForm
          projectId={projectId}
          idempotencyKey={idempotencyKey}
          pkg={{
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            priceCents: pkg.priceCents,
            currency: pkg.currency,
            revisionCredits: pkg.revisionCredits,
            deliveryHours: pkg.deliveryHours,
          }}
          userEmail={user?.email ?? null}
          isLoggedIn={Boolean(user)}
        />
      ) : (
        <p className="mt-8 rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
          The launch offer is temporarily unavailable. Please try again shortly.
        </p>
      )}
    </StudioShell>
  );
}

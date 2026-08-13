import Link from "next/link";
import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { confirmReviewAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import { listPackages } from "@/lib/db/repository";
import { formatCurrency } from "@/lib/utils";
import { getEnv } from "@/lib/env";
import { filterPackagesForRelease } from "@/lib/features";

export default async function ReviewStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const project = await loadStudioProject(projectId);
  const packages = filterPackagesForRelease(await listPackages(), getEnv().VIDEO_FEATURE_ENABLED);
  const pkg = packages.find((p) => p.id === project.packageId) || packages[0];
  return (
    <StudioShell projectId={projectId} currentStep={7}>
      <h1 className="font-display text-4xl text-navy">Review your story</h1>
      <p className="mt-3 prose-muted">Everything look right? You can edit any section before checkout.</p>
      <FormError message={error} />
      <div className="mt-8 space-y-4">
        {[
          ["Occasion", project.occasion, "occasion"],
          ["Recipient", project.recipient?.name, "recipient"],
          ["Story highlight", project.story?.favoriteMemory, "story"],
          ["Genre / mood", `${project.preferences?.genre || "—"} · ${project.preferences?.mood || "—"}`, "style"],
          ["Lyric tone", project.preferences?.lyricTone, "lyrics"],
          ["Media uploads", `${project.media?.length || 0} file(s)`, "media"],
        ].map(([label, value, path]) => (
          <div key={String(path)} className="surface-card flex items-start justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">{label}</p>
              <p className="mt-1 text-navy">{value || "Not provided"}</p>
            </div>
            <Link href={`/studio/${projectId}/${path}`} className="text-sm font-semibold text-rose underline">Edit</Link>
          </div>
        ))}
        <div className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Package</p>
          <p className="mt-1 font-display text-2xl text-navy">{pkg?.name}</p>
          <p className="text-muted">{pkg ? formatCurrency(pkg.priceCents, pkg.currency) : ""} · Est. delivery {pkg?.deliveryHours}h</p>
        </div>
      </div>
      <form action={confirmReviewAction.bind(null, projectId)} className="mt-8 space-y-4">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="accuracyConfirmed" required className="mt-1" />
          I confirm this information is accurate.
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="rightsConfirmed" required className="mt-1" />
          I have rights to the stories and media I uploaded.
        </label>
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/media`} className="btn-secondary">Back</Link>
          <button type="submit" className="btn-primary">Continue to checkout</button>
        </div>
      </form>
    </StudioShell>
  );
}

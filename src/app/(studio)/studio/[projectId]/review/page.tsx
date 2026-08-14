import Link from "next/link";
import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { confirmReviewAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import { listPackages } from "@/lib/db/repository";
import { formatCurrency } from "@/lib/utils";
import { getEnv } from "@/lib/env";
import { filterPackagesForRelease } from "@/lib/features";
import { getLocale, getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export default async function ReviewStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const [project, allPackages, messages, locale] = await Promise.all([
    loadStudioProject(projectId),
    listPackages(),
    getMessages(),
    getLocale(),
  ]);
  const packages = filterPackagesForRelease(allPackages, getEnv().VIDEO_FEATURE_ENABLED);
  const pkg = packages.find((p) => p.id === project.packageId) || packages[0];
  const copy = messages.studio.review;
  const packageCopy = pkg
    ? messages.pricing.packages[pkg.slug as keyof typeof messages.pricing.packages]
    : null;
  const occasion = project.occasion
    ? messages.occasions.items[project.occasion as keyof typeof messages.occasions.items]?.name ?? project.occasion
    : messages.common.notProvided;
  const genre = project.preferences?.genre
    ? messages.catalog.genres[project.preferences.genre as keyof typeof messages.catalog.genres] ?? project.preferences.genre
    : "—";
  const mood = project.preferences?.mood
    ? messages.catalog.moods[project.preferences.mood as keyof typeof messages.catalog.moods] ?? project.preferences.mood
    : "—";
  const tone = project.preferences?.lyricTone
    ? messages.catalog.tones[project.preferences.lyricTone as keyof typeof messages.catalog.tones] ?? project.preferences.lyricTone
    : messages.common.notProvided;
  return (
    <StudioShell projectId={projectId} currentStep={7}>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <p className="mt-3 prose-muted">{copy.body}</p>
      <FormError message={error} />
      <div className="mt-8 space-y-4">
        {[
          [copy.occasion, occasion, "occasion"],
          [copy.recipient, project.recipient?.name, "recipient"],
          [copy.story, project.story?.favoriteMemory, "story"],
          [copy.genreMood, `${genre} · ${mood}`, "style"],
          [copy.tone, tone, "lyrics"],
          [copy.uploads, `${project.media?.length || 0} ${copy.files}`, "media"],
        ].map(([label, value, path]) => (
          <div key={String(path)} className="surface-card flex items-start justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">{label}</p>
              <p className="mt-1 text-navy">{value || messages.common.notProvided}</p>
            </div>
            <Link href={`/studio/${projectId}/${path}`} className="text-sm font-semibold text-rose underline">{messages.common.edit}</Link>
          </div>
        ))}
        <div className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">{copy.package}</p>
          <p className="mt-1 font-display text-2xl text-navy">{packageCopy?.name ?? pkg?.name}</p>
          <p className="text-muted">{pkg ? formatCurrency(pkg.priceCents, pkg.currency, locale) : ""} · {copy.delivery} {pkg?.deliveryHours}h</p>
        </div>
      </div>
      <form action={confirmReviewAction.bind(null, projectId)} className="mt-8 space-y-4">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="accuracyConfirmed" required className="mt-1" />
          {copy.accuracy}
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="rightsConfirmed" required className="mt-1" />
          {copy.rights}
        </label>
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/media`} className="btn-secondary">{messages.common.back}</Link>
          <SubmitButton label={copy.checkout} pendingLabel={messages.common.saving} />
        </div>
      </form>
    </StudioShell>
  );
}

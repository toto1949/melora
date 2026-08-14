import Link from "next/link";
import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { VIDEO_STYLES } from "@/lib/constants";
import { saveMediaAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import { getEnv } from "@/lib/env";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export default async function MediaStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const [project, messages] = await Promise.all([loadStudioProject(projectId), getMessages()]);
  const videoEnabled = getEnv().VIDEO_FEATURE_ENABLED;
  const copy = messages.studio.media;
  return (
    <StudioShell projectId={projectId} currentStep={6}>
      <h1 className="font-display text-4xl text-navy">{videoEnabled ? copy.titleVideo : copy.title}</h1>
      <p className="mt-3 prose-muted">
        {videoEnabled ? copy.bodyVideo : copy.body} {copy.privacy}
      </p>
      <FormError message={error} />
      <form action={saveMediaAction.bind(null, projectId)} className="mt-8 space-y-5" encType="multipart/form-data">
        <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
          <label htmlFor="files" className="cursor-pointer">
            <span className="font-semibold text-navy">{copy.browse}</span>
            <span className="mt-2 block text-sm text-muted">
              {videoEnabled ? copy.videoTypes : copy.imageTypes}
            </span>
            <input id="files" name="files" type="file" multiple accept={videoEnabled ? "image/*,video/*" : "image/jpeg,image/png,image/webp"} capture="environment" className="mt-4 block w-full text-sm" />
          </label>
        </div>
        {project.media?.length ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {project.media.map((m) => (
              <li key={m.id} className="rounded-2xl border border-border bg-surface p-3 text-xs">
                {m.fileName}
              </li>
            ))}
          </ul>
        ) : null}
        {videoEnabled ? <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="videoStyle">{copy.videoStyle}</label>
          <select id="videoStyle" name="videoStyle" defaultValue={project.preferences?.videoStyle || "Cinematic"} className="w-full rounded-2xl border border-border bg-surface px-4 py-3">
            {VIDEO_STYLES.map((style) => <option key={style} value={style}>{messages.catalog.videoStyles[style as keyof typeof messages.catalog.videoStyles] ?? style}</option>)}
          </select>
        </div> : null}
        <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
          <input type="checkbox" name="consentConfirmed" required className="mt-1" />
          <span>{copy.consent}</span>
        </label>
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/lyrics`} className="btn-secondary">{messages.common.back}</Link>
          <SubmitButton label={messages.common.continue} pendingLabel={messages.common.saving} />
        </div>
      </form>
    </StudioShell>
  );
}

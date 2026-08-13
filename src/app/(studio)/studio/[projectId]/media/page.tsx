import Link from "next/link";
import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { VIDEO_STYLES } from "@/lib/constants";
import { saveMediaAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import { getEnv } from "@/lib/env";

export default async function MediaStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const project = await loadStudioProject(projectId);
  const videoEnabled = getEnv().VIDEO_FEATURE_ENABLED;
  return (
    <StudioShell projectId={projectId} currentStep={6}>
      <h1 className="font-display text-4xl text-navy">{videoEnabled ? "Photos & video" : "Photos"}</h1>
      <p className="mt-3 prose-muted">
        {videoEnabled
          ? "Optional. Upload portraits, couple photos, family photos, or short clips for cover art and music videos."
          : "Optional. Upload portraits, couple photos, or family photos for your keepsake. Video will arrive in our next release."}
        Files stay private and are never used for training without explicit opt-in.
      </p>
      <FormError message={error} />
      <form action={saveMediaAction.bind(null, projectId)} className="mt-8 space-y-5" encType="multipart/form-data">
        <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
          <label htmlFor="files" className="cursor-pointer">
            <span className="font-semibold text-navy">Drag & drop or browse files</span>
            <span className="mt-2 block text-sm text-muted">
              {videoEnabled ? "JPG, PNG, WEBP, MP4, MOV · 10 MB total" : "JPG, PNG, WEBP · 10 MB total"}
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
          <label className="mb-1.5 block text-sm font-medium" htmlFor="videoStyle">Video style</label>
          <select id="videoStyle" name="videoStyle" defaultValue={project.preferences?.videoStyle || "Cinematic"} className="w-full rounded-2xl border border-border bg-surface px-4 py-3">
            {VIDEO_STYLES.map((style) => <option key={style}>{style}</option>)}
          </select>
        </div> : null}
        <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
          <input type="checkbox" name="consentConfirmed" required className="mt-1" />
          <span>
            I confirm I have the rights to upload this content and Memories to Melody may process it solely to fulfill my order.
            I understand uploads are not used for model training unless I later opt in.
          </span>
        </label>
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/lyrics`} className="btn-secondary">Back</Link>
          <button type="submit" className="btn-primary">Continue</button>
        </div>
      </form>
    </StudioShell>
  );
}

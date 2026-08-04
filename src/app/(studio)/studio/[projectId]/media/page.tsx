import Link from "next/link";
import { StudioShell } from "@/components/studio/studio-shell";
import { VIDEO_STYLES } from "@/lib/constants";
import { saveMediaAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";

export default async function MediaStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await loadStudioProject(projectId);
  return (
    <StudioShell projectId={projectId} currentStep={6}>
      <h1 className="font-display text-4xl text-navy">Photos & video</h1>
      <p className="mt-3 prose-muted">
        Optional. Upload portraits, couple photos, family photos, or short clips for cover art and music videos.
        Files stay private and are never used for training without explicit opt-in.
      </p>
      <form action={saveMediaAction.bind(null, projectId)} className="mt-8 space-y-5" encType="multipart/form-data">
        <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
          <label htmlFor="files" className="cursor-pointer">
            <span className="font-semibold text-navy">Drag & drop or browse files</span>
            <span className="mt-2 block text-sm text-muted">JPG, PNG, WEBP, MP4, MOV · Mobile camera supported</span>
            <input id="files" name="files" type="file" multiple accept="image/*,video/*" capture="environment" className="mt-4 block w-full text-sm" />
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
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="videoStyle">Video style</label>
          <select id="videoStyle" name="videoStyle" defaultValue={project.preferences?.videoStyle || "Cinematic"} className="w-full rounded-2xl border border-border bg-surface px-4 py-3">
            {VIDEO_STYLES.map((style) => <option key={style}>{style}</option>)}
          </select>
        </div>
        <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
          <input type="checkbox" name="consentConfirmed" required className="mt-1" />
          <span>
            I confirm I have the rights to upload this content and Melora may process it solely to fulfill my order.
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

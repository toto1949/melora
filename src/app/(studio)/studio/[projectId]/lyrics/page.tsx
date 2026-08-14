import Link from "next/link";
import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { LYRIC_TONES } from "@/lib/constants";
import { saveLyricsAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export default async function LyricsStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const [project, messages] = await Promise.all([loadStudioProject(projectId), getMessages()]);
  const copy = messages.studio.lyrics;
  const p = project.preferences;
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <StudioShell projectId={projectId} currentStep={5}>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <p className="mt-3 prose-muted">{copy.body}</p>
      <FormError message={error} />
      <form action={saveLyricsAction.bind(null, projectId)} className="mt-8 space-y-5">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{copy.tone}</legend>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {LYRIC_TONES.map((tone) => (
              <label key={tone} className="rounded-2xl border border-border bg-surface px-3 py-3 text-sm has-[:checked]:ring-2 has-[:checked]:ring-gold">
                <input type="radio" name="lyricTone" value={tone} required defaultChecked={p?.lyricTone === tone || (!p?.lyricTone && tone === "Emotional")} className="me-2" />
                {messages.catalog.tones[tone as keyof typeof messages.catalog.tones] ?? tone}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="mustInclude">{copy.include}</label>
          <input id="mustInclude" name="mustInclude" defaultValue={(p?.mustInclude || []).join(", ")} className={field} placeholder={copy.includeHint} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="mustExclude">{copy.exclude}</label>
          <input id="mustExclude" name="mustExclude" defaultValue={(p?.mustExclude || []).join(", ")} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="chorusMessage">{copy.chorus}</label>
          <textarea id="chorusMessage" name="chorusMessage" defaultValue={p?.chorusMessage || ""} className={field + " min-h-24"} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="desiredLength">{copy.length}</label>
          <select id="desiredLength" name="desiredLength" defaultValue={p?.desiredLength || "Standard (~3 min)"} className={field}>
            <option value="Short (~2 min)">{copy.short}</option>
            <option value="Standard (~3 min)">{copy.standard}</option>
            <option value="Extended (~4 min)">{copy.extended}</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/style`} className="btn-secondary">{messages.common.back}</Link>
          <SubmitButton label={messages.common.continue} pendingLabel={messages.common.saving} />
        </div>
      </form>
    </StudioShell>
  );
}

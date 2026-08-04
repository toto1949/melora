import Link from "next/link";
import { StudioShell } from "@/components/studio/studio-shell";
import { LYRIC_TONES } from "@/lib/constants";
import { saveLyricsAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";

export default async function LyricsStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await loadStudioProject(projectId);
  const p = project.preferences;
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <StudioShell projectId={projectId} currentStep={5}>
      <h1 className="font-display text-4xl text-navy">Lyrics direction</h1>
      <p className="mt-3 prose-muted">Guide the emotional tone and any words that must (or must not) appear.</p>
      <form action={saveLyricsAction.bind(null, projectId)} className="mt-8 space-y-5">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Lyric tone</legend>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {LYRIC_TONES.map((tone) => (
              <label key={tone} className="rounded-2xl border border-border bg-surface px-3 py-3 text-sm has-[:checked]:ring-2 has-[:checked]:ring-gold">
                <input type="radio" name="lyricTone" value={tone} required defaultChecked={p?.lyricTone === tone || (!p?.lyricTone && tone === "Emotional")} className="mr-2" />
                {tone}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="mustInclude">Words that must be included</label>
          <input id="mustInclude" name="mustInclude" defaultValue={(p?.mustInclude || []).join(", ")} className={field} placeholder="names, places, phrases" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="mustExclude">Words that must not be included</label>
          <input id="mustExclude" name="mustExclude" defaultValue={(p?.mustExclude || []).join(", ")} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="chorusMessage">Preferred chorus message</label>
          <textarea id="chorusMessage" name="chorusMessage" defaultValue={p?.chorusMessage || ""} className={field + " min-h-24"} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="desiredLength">Desired song length</label>
          <select id="desiredLength" name="desiredLength" defaultValue={p?.desiredLength || "Standard (~3 min)"} className={field}>
            <option>Short (~2 min)</option>
            <option>Standard (~3 min)</option>
            <option>Extended (~4 min)</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/style`} className="btn-secondary">Back</Link>
          <button type="submit" className="btn-primary">Continue</button>
        </div>
      </form>
    </StudioShell>
  );
}

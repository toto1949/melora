import Link from "next/link";
import { StudioShell } from "@/components/studio/studio-shell";
import { GENRES, LANGUAGES, MOODS, VOCAL_TYPES } from "@/lib/constants";
import { saveStyleAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";

export default async function StyleStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await loadStudioProject(projectId);
  const p = project.preferences;
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <StudioShell projectId={projectId} currentStep={4}>
      <h1 className="font-display text-4xl text-navy">Choose your sound</h1>
      <p className="mt-3 prose-muted">Pick a genre and vocal feel. Short demo clips use the same sample tone in local development.</p>
      <form action={saveStyleAction.bind(null, projectId)} className="mt-8 space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Genre</legend>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {GENRES.map((genre) => (
              <label key={genre.slug} className="rounded-2xl border border-border bg-surface px-3 py-3 text-sm has-[:checked]:ring-2 has-[:checked]:ring-gold">
                <input type="radio" name="genre" value={genre.slug} required defaultChecked={p?.genre === genre.slug || (!p?.genre && genre.slug === "pop")} className="mr-2" />
                {genre.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="mood">Mood</label>
            <select id="mood" name="mood" required defaultValue={p?.mood || "Emotional"} className={field}>
              {MOODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="vocalType">Vocal type</label>
            <select id="vocalType" name="vocalType" required defaultValue={p?.vocalType || "Soft female"} className={field}>
              {VOCAL_TYPES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="energy">Energy</label>
            <select id="energy" name="energy" defaultValue={p?.energy || "Medium"} className={field}>
              <option>Soft</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="tempo">Tempo</label>
            <select id="tempo" name="tempo" defaultValue={p?.tempo || "Moderate"} className={field}>
              <option>Slow</option><option>Moderate</option><option>Upbeat</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="language">Song language</label>
            <select id="language" name="language" defaultValue={p?.language || "en"} className={field}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="duetPreference">Duet preference</label>
            <select id="duetPreference" name="duetPreference" defaultValue={p?.duetPreference || "Solo"} className={field}>
              <option>Solo</option><option>Duet</option><option>No preference</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium" htmlFor="instruments">Instrument preferences</label>
            <input id="instruments" name="instruments" defaultValue={(p?.instruments || []).join(", ")} className={field} placeholder="piano, guitar, strings" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium" htmlFor="customStyle">Custom style notes</label>
            <input id="customStyle" name="customStyle" defaultValue={p?.customStyle || ""} className={field} />
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="explicitContent" defaultChecked={p?.explicitContent} />
            Allow explicit content if it fits the story
          </label>
        </div>
        <audio controls className="w-full" src="/samples/audio/placeholder-tone.wav" preload="none">
          Your browser does not support audio.
        </audio>
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/story`} className="btn-secondary">Back</Link>
          <button type="submit" className="btn-primary">Continue</button>
        </div>
      </form>
    </StudioShell>
  );
}

import Link from "next/link";
import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { GENRES, LANGUAGES, MOODS, VOCAL_TYPES } from "@/lib/constants";
import { saveStyleAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export default async function StyleStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const [project, messages] = await Promise.all([loadStudioProject(projectId), getMessages()]);
  const copy = messages.studio.style;
  const p = project.preferences;
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <StudioShell projectId={projectId} currentStep={4}>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <p className="mt-3 prose-muted">{copy.body}</p>
      <FormError message={error} />
      <form action={saveStyleAction.bind(null, projectId)} className="mt-8 space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{copy.genre}</legend>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {GENRES.map((genre) => (
              <label key={genre.slug} className="rounded-2xl border border-border bg-surface px-3 py-3 text-sm has-[:checked]:ring-2 has-[:checked]:ring-gold">
                <input type="radio" name="genre" value={genre.slug} required defaultChecked={p?.genre === genre.slug || (!p?.genre && genre.slug === "pop")} className="me-2" />
                {messages.catalog.genres[genre.slug as keyof typeof messages.catalog.genres] ?? genre.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="mood">{copy.mood}</label>
            <select id="mood" name="mood" required defaultValue={p?.mood || "Emotional"} className={field}>
              {MOODS.map((m) => <option key={m} value={m}>{messages.catalog.moods[m as keyof typeof messages.catalog.moods] ?? m}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="vocalType">{copy.vocal}</label>
            <select id="vocalType" name="vocalType" required defaultValue={p?.vocalType || "Soft female"} className={field}>
              {VOCAL_TYPES.map((m) => <option key={m} value={m}>{messages.catalog.vocals[m as keyof typeof messages.catalog.vocals] ?? m}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="energy">{copy.energy}</label>
            <select id="energy" name="energy" defaultValue={p?.energy || "Medium"} className={field}>
              <option value="Soft">{copy.options.soft}</option><option value="Medium">{copy.options.medium}</option><option value="High">{copy.options.high}</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="tempo">{copy.tempo}</label>
            <select id="tempo" name="tempo" defaultValue={p?.tempo || "Moderate"} className={field}>
              <option value="Slow">{copy.options.slow}</option><option value="Moderate">{copy.options.moderate}</option><option value="Upbeat">{copy.options.upbeat}</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="language">{copy.language}</label>
            <select id="language" name="language" defaultValue={p?.language || "en"} className={field}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="duetPreference">{copy.duet}</label>
            <select id="duetPreference" name="duetPreference" defaultValue={p?.duetPreference || "Solo"} className={field}>
              <option value="Solo">{copy.options.solo}</option><option value="Duet">{copy.options.duet}</option><option value="No preference">{copy.options.none}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium" htmlFor="instruments">{copy.instruments}</label>
            <input id="instruments" name="instruments" defaultValue={(p?.instruments || []).join(", ")} className={field} placeholder={copy.instrumentsHint} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium" htmlFor="customStyle">{copy.custom}</label>
            <input id="customStyle" name="customStyle" defaultValue={p?.customStyle || ""} className={field} />
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="explicitContent" defaultChecked={p?.explicitContent} />
            {copy.explicit}
          </label>
        </div>
        <audio controls className="w-full" src="/samples/audio/placeholder-tone.wav" preload="none">
          {copy.audioFallback}
        </audio>
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/story`} className="btn-secondary">{messages.common.back}</Link>
          <SubmitButton label={messages.common.continue} pendingLabel={messages.common.saving} />
        </div>
      </form>
    </StudioShell>
  );
}

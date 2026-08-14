import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { saveStoryAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import Link from "next/link";
import { VoiceHint } from "@/components/studio/voice-hint";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

const fields = [
  ["howTheyMet", false],
  ["favoriteMemory", true],
  ["importantDates", false],
  ["meaningfulPlaces", false],
  ["insideJokes", false],
  ["challengesOvercome", false],
  ["whatMakesSpecial", true],
  ["personalMessage", false],
] as const;

export default async function StoryStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const [project, messages] = await Promise.all([loadStudioProject(projectId), getMessages()]);
  const copy = messages.studio.story;
  const s = project.story as Record<string, string | null | undefined> | null;
  return (
    <StudioShell projectId={projectId} currentStep={3}>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <p className="mt-3 prose-muted">{copy.body}</p>
      <VoiceHint />
      <FormError message={error} />
      <form action={saveStoryAction.bind(null, projectId)} className="mt-6 space-y-4">
        {fields.map(([name, required]) => (
          <div key={name}>
            <label className="mb-1.5 block text-sm font-medium" htmlFor={name}>
              {copy.fields[name].label}
              {required ? <span className="ms-1 text-muted">({copy.minimum})</span> : null}
            </label>
            <textarea
              id={name}
              name={name}
              required={required}
              minLength={required ? 10 : undefined}
              maxLength={2000}
              defaultValue={s?.[name] || ""}
              placeholder={copy.fields[name].hint}
              className="min-h-28 w-full rounded-2xl border border-border bg-surface px-4 py-3"
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/recipient`} className="btn-secondary">{messages.common.back}</Link>
          <SubmitButton label={messages.common.continue} pendingLabel={messages.common.saving} />
        </div>
      </form>
    </StudioShell>
  );
}

import { StudioShell } from "@/components/studio/studio-shell";
import { saveStoryAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import Link from "next/link";
import { VoiceHint } from "@/components/studio/voice-hint";

const fields = [
  ["howTheyMet", "How you met", "Optional", false],
  ["favoriteMemory", "Favorite memory", "Example: Sunday markets and shared playlists", true],
  ["importantDates", "Important dates", "Optional", false],
  ["meaningfulPlaces", "Meaningful places", "Optional", false],
  ["insideJokes", "Inside jokes", "Optional", false],
  ["challengesOvercome", "Challenges overcome", "Optional", false],
  ["whatMakesSpecial", "What makes them special", "The qualities only you notice", true],
  ["personalMessage", "Message you want communicated", "Optional", false],
] as const;

export default async function StoryStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await loadStudioProject(projectId);
  const s = project.story as Record<string, string | null | undefined> | null;
  return (
    <StudioShell projectId={projectId} currentStep={3}>
      <h1 className="font-display text-4xl text-navy">Tell us their story</h1>
      <p className="mt-3 prose-muted">Guided prompts help us write lyrics that feel personal. Aim for a few vivid details.</p>
      <VoiceHint />
      <form action={saveStoryAction.bind(null, projectId)} className="mt-6 space-y-4">
        {fields.map(([name, label, hint, required]) => (
          <div key={name}>
            <label className="mb-1.5 block text-sm font-medium" htmlFor={name}>{label}</label>
            <textarea
              id={name}
              name={name}
              required={required}
              maxLength={2000}
              defaultValue={s?.[name] || ""}
              placeholder={hint}
              className="min-h-28 w-full rounded-2xl border border-border bg-surface px-4 py-3"
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/recipient`} className="btn-secondary">Back</Link>
          <button type="submit" className="btn-primary">Continue</button>
        </div>
      </form>
    </StudioShell>
  );
}

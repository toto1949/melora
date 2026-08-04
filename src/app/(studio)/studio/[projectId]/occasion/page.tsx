import { StudioShell } from "@/components/studio/studio-shell";
import { OCCASIONS } from "@/lib/constants";
import { saveOccasionAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";

export default async function OccasionStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await loadStudioProject(projectId);
  return (
    <StudioShell projectId={projectId} currentStep={1}>
      <h1 className="font-display text-4xl text-navy md:text-5xl">What are we celebrating?</h1>
      <p className="mt-3 prose-muted">Choose the occasion that best fits this gift.</p>
      <form action={saveOccasionAction.bind(null, projectId)} className="mt-8 grid gap-3 sm:grid-cols-2">
        {OCCASIONS.map((occasion) => (
          <label key={occasion.slug} className="surface-card cursor-pointer p-5 has-[:checked]:ring-2 has-[:checked]:ring-gold">
            <input
              type="radio"
              name="occasion"
              value={occasion.slug}
              required
              defaultChecked={project.occasion === occasion.slug}
              className="sr-only"
            />
            <span className="font-display text-xl text-navy">{occasion.name}</span>
            <span className="mt-2 block text-sm text-muted">{occasion.description}</span>
          </label>
        ))}
        <button type="submit" className="btn-primary sm:col-span-2 mt-2">Continue</button>
      </form>
    </StudioShell>
  );
}

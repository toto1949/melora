import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { OccasionPicker } from "@/components/studio/occasion-picker";
import { OCCASIONS } from "@/lib/constants";
import { saveOccasionAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";

export default async function OccasionStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const project = await loadStudioProject(projectId);
  return (
    <StudioShell projectId={projectId} currentStep={1}>
      <h1 className="font-display text-4xl text-navy md:text-5xl">What are we celebrating?</h1>
      <p className="mt-3 prose-muted">Choose the occasion that best fits this gift.</p>
      <FormError message={error} />
      <OccasionPicker
        occasions={OCCASIONS.map(({ slug, name, description }) => ({ slug, name, description }))}
        defaultValue={project.occasion}
        action={saveOccasionAction.bind(null, projectId)}
      />
    </StudioShell>
  );
}

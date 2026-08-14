import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { OccasionPicker } from "@/components/studio/occasion-picker";
import { OCCASIONS } from "@/lib/constants";
import { saveOccasionAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import { getMessages } from "@/lib/i18n";

export default async function OccasionStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const [project, messages] = await Promise.all([loadStudioProject(projectId), getMessages()]);
  const copy = messages.studio.occasion;
  return (
    <StudioShell projectId={projectId} currentStep={1}>
      <h1 className="font-display text-4xl text-navy md:text-5xl">{copy.title}</h1>
      <p className="mt-3 prose-muted">{copy.body}</p>
      <FormError message={error} />
      <OccasionPicker
        occasions={OCCASIONS.map(({ slug }) => ({ slug, ...messages.occasions.items[slug] }))}
        defaultValue={project.occasion}
        action={saveOccasionAction.bind(null, projectId)}
      />
    </StudioShell>
  );
}

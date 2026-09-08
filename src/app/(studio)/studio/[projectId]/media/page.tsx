import { redirect } from "next/navigation";
import { loadStudioProject } from "@/lib/studio/load-project";

export default async function MediaStep({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  await loadStudioProject(projectId);
  redirect(`/studio/${projectId}/review`);
}

import { notFound, redirect } from "next/navigation";
import { getGuestToken, getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/lib/db/repository";

export async function loadStudioProject(projectId: string) {
  const guestToken = await getGuestToken();
  const user = await getCurrentUser();
  const project = await getProject(projectId, guestToken);
  if (!project) notFound();
  if (project.userId && user?.id !== project.userId && user?.role === "customer") {
    redirect("/auth/sign-in");
  }
  return project;
}

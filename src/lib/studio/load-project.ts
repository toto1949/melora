import { notFound, redirect } from "next/navigation";
import { getGuestToken, getCurrentUser } from "@/lib/auth/session";
import { ownsProject } from "@/lib/security/ownership";
import { getProject, getProjectOrder } from "@/lib/db/repository";

export async function loadStudioProject(projectId: string, allowCheckout = false) {
  const guestToken = await getGuestToken();
  const user = await getCurrentUser();
  const project = await getProject(projectId, guestToken);
  if (!project) notFound();
  if (!ownsProject(project, user, guestToken)) {
    redirect("/auth/sign-in");
  }
  if (project.status !== "draft") {
    const order = await getProjectOrder(projectId);
    if (order && (!allowCheckout || order.paymentStatus === "paid")) redirect(`/payment-success?order_id=${order.id}`);
  }
  return project;
}

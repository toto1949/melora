import type { Order, Profile, Project } from "@/types";

export function ownsProject(project: Project, user: Profile | null, guestToken: string | null) {
  if (project.userId) return !!user && user.id === project.userId;
  return !!guestToken && !!project.guestToken && guestToken === project.guestToken;
}
export function ownsOrder(order: Order, user: Profile | null, guestToken: string | null) {
  if (order.userId) return !!user && user.id === order.userId;
  return !!order.project && ownsProject(order.project, null, guestToken);
}

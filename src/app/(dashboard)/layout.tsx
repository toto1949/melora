import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  return <DashboardShell user={user}>{children}</DashboardShell>;
}

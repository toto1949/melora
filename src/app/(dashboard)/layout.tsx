import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  return <DashboardShell user={user}>{children}</DashboardShell>;
}

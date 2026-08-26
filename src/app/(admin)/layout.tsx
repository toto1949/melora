import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell";
import { getCurrentUser } from "@/lib/auth/session";

const staff = new Set(["super_admin", "support", "producer", "reviewer", "content_manager"]);

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || !staff.has(user.role)) redirect("/auth/sign-in");
  return <AdminShell user={user}>{children}</AdminShell>;
}

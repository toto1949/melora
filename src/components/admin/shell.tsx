import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";
import type { Profile } from "@/types";

const links = [
  ["/admin", "Overview"],
  ["/admin/marketing", "Marketing"],
  ["/admin/orders", "Orders"],
  ["/admin/jobs", "Jobs"],
  ["/admin/revisions", "Revisions"],
  ["/admin/support", "Support"],
  ["/admin/packages", "Packages"],
  ["/admin/coupons", "Coupons"],
  ["/admin/samples", "Samples"],
  ["/admin/reviews", "Reviews"],
  ["/admin/content", "Content"],
  ["/admin/providers", "Providers"],
  ["/admin/analytics", "Analytics"],
  ["/admin/audit", "Audit logs"],
  ["/admin/users", "Users"],
] as const;

export function AdminShell({ user, children }: { user: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy text-cream">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="font-display text-2xl">Memories to Melody Admin</p>
          <p className="mt-1 text-xs text-cream/60">{user.role}</p>
          <nav className="mt-6 space-y-1 text-sm">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="block rounded-xl px-3 py-2 hover:bg-white/10">
                {label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction} className="mt-6">
            <button type="submit" className="rounded-full border border-white/20 px-4 py-2 text-sm">
              Sign out
            </button>
          </form>
        </aside>
        <div className="rounded-3xl bg-cream p-5 text-navy md:p-8">{children}</div>
      </div>
    </div>
  );
}

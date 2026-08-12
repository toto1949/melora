import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";
import type { Profile } from "@/types";

const links = [
  ["/dashboard", "Overview"],
  ["/dashboard/songs", "My Songs"],
  ["/dashboard/orders", "Active Orders"],
  ["/dashboard/drafts", "Draft Projects"],
  ["/dashboard/favorites", "Favorites"],
  ["/dashboard/billing", "Billing"],
  ["/dashboard/profile", "Profile"],
  ["/dashboard/notifications", "Notifications"],
  ["/dashboard/support", "Support"],
] as const;

export function DashboardShell({
  user,
  children,
}: {
  user: Profile;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-6">
        <aside className="surface-card h-fit p-4">
          <Link href="/" className="font-display text-2xl text-navy">
            Memories to Melody
          </Link>
          <p className="mt-2 text-xs text-muted">{user.email}</p>
          <nav className="mt-6 space-y-1" aria-label="Dashboard">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-navy hover:bg-cream-deep"
              >
                {label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction} className="mt-6">
            <button type="submit" className="btn-secondary w-full !py-2 text-sm">
              Sign out
            </button>
          </form>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}

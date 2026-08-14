"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { useLocale } from "@/components/i18n/locale-provider";
import type { Profile } from "@/types";

const links = [
  ["/dashboard", "overview"],
  ["/dashboard/songs", "songs"],
  ["/dashboard/orders", "orders"],
  ["/dashboard/drafts", "drafts"],
  ["/dashboard/favorites", "favorites"],
  ["/dashboard/billing", "billing"],
  ["/dashboard/profile", "profile"],
  ["/dashboard/notifications", "notifications"],
  ["/dashboard/support", "support"],
] as const;

export function DashboardShell({ user, children }: { user: Profile; children: React.ReactNode }) {
  const { messages } = useLocale();
  const copy = messages.dashboard;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  const navigation = (
    <>
      <Link href="/" className="font-display text-2xl text-navy">{messages.brand.name}</Link>
      <p className="mt-2 truncate text-xs text-muted">{user.email}</p>
      <nav className="mt-6 space-y-1" aria-label={copy.aria}>
        {links.map(([href, key]) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-xl px-3 py-2 text-sm font-medium text-navy transition-colors ${active ? "bg-cream-deep" : "hover:bg-cream-deep"}`}
            >
              {copy.nav[key]}
            </Link>
          );
        })}
      </nav>
      <form action={signOutAction} className="mt-6">
        <button type="submit" className="btn-secondary w-full !py-2 text-sm">{copy.signOut}</button>
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-border bg-cream/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/dashboard" className="truncate font-display text-xl text-navy">{messages.brand.name}</Link>
          <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="dashboard-mobile-nav" className="rounded-xl border border-border bg-surface p-2 text-navy">
            <span className="sr-only">{copy.menu}</span><Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" onClick={() => setOpen(false)} className="absolute inset-0 bg-navy/45" aria-label={copy.closeMenu} />
          <aside id="dashboard-mobile-nav" className="absolute inset-y-0 end-0 w-[min(20rem,88vw)] overflow-y-auto bg-surface p-5 shadow-2xl">
            <div className="flex justify-end">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-navy" aria-label={copy.closeMenu}><X className="h-5 w-5" /></button>
            </div>
            {navigation}
          </aside>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:px-6">
        <aside className="surface-card hidden h-fit p-4 md:block">{navigation}</aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

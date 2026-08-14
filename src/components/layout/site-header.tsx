"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface HeaderLabels {
  examples: string;
  howItWorks: string;
  occasions: string;
  reviews: string;
  pricing: string;
  faq: string;
  trackOrder: string;
  signIn: string;
  create: string;
  dashboard: string;
  openMenu: string;
  closeMenu: string;
}

const DEFAULT_LABELS: HeaderLabels = {
  examples: "Examples",
  howItWorks: "How It Works",
  occasions: "Occasions",
  reviews: "Reviews",
  pricing: "Pricing",
  faq: "FAQ",
  trackOrder: "Track Order",
  signIn: "Sign In",
  create: "Create Your Song",
  dashboard: "Dashboard",
  openMenu: "Open menu",
  closeMenu: "Close menu",
};

export function SiteHeader({
  signedIn = false,
  labels = DEFAULT_LABELS,
}: {
  signedIn?: boolean;
  labels?: HeaderLabels;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/examples", label: labels.examples },
    { href: "/how-it-works", label: labels.howItWorks },
    { href: "/occasions", label: labels.occasions },
    { href: "/reviews", label: labels.reviews },
    { href: "/pricing", label: labels.pricing },
    { href: "/faq", label: labels.faq },
    { href: "/track-order", label: labels.trackOrder },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-cream/80 backdrop-blur-xl transition-shadow duration-300",
        scrolled ? "border-border shadow-[0_8px_30px_rgba(11,20,38,0.08)]" : "border-border/40"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight text-navy transition-opacity hover:opacity-80"
        >
          {BRAND.name}
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-active={pathname === link.href}
              className="link-underline text-sm font-medium text-navy/80 transition hover:text-navy data-[active=true]:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href={signedIn ? "/dashboard" : "/auth/sign-in"} className="btn-secondary !py-2.5 !px-4 text-sm">
            {signedIn ? labels.dashboard : labels.signIn}
          </Link>
          <Link href="/studio" className="btn-primary !py-2.5 !px-4 text-sm">
            {labels.create}
          </Link>
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-navy lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? labels.closeMenu : labels.openMenu}</span>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border lg:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn("rounded-xl px-3 py-3 text-base font-medium text-navy hover:bg-cream-deep")}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={signedIn ? "/dashboard" : "/auth/sign-in"}
                className="btn-secondary mt-2"
                onClick={() => setOpen(false)}
              >
                {signedIn ? labels.dashboard : labels.signIn}
              </Link>
              <Link href="/studio" className="btn-primary" onClick={() => setOpen(false)}>
                {labels.create}
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

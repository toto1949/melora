"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

const links = [
  { href: "/examples", label: "Examples" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/occasions", label: "Occasions" },
  { href: "/reviews", label: "Reviews" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/track-order", label: "Track Order" },
];

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="font-display text-2xl tracking-tight text-navy">
          {BRAND.name}
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-navy/80 transition hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href={signedIn ? "/dashboard" : "/auth/sign-in"} className="btn-secondary !py-2.5 !px-4 text-sm">
            {signedIn ? "Dashboard" : "Sign In"}
          </Link>
          <Link href="/studio" className="btn-primary !py-2.5 !px-4 text-sm">
            Create Your Song
          </Link>
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-navy lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
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
                {signedIn ? "Dashboard" : "Sign In"}
              </Link>
              <Link href="/studio" className="btn-primary" onClick={() => setOpen(false)}>
                Create Your Song
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

import Link from "next/link";
import { BRAND } from "@/lib/constants";
import type { Locale, Messages } from "@/lib/i18n";
import { LocaleSwitcher } from "./locale-switcher";

export function SiteFooter({ locale, messages }: { locale: Locale; messages: Messages }) {
  const footer = messages.footer;
  return (
    <footer className="border-t border-border bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="space-y-3 md:col-span-1">
          <p className="font-display text-3xl">{BRAND.name}</p>
          <p className="text-sm text-cream/70">
            {footer.description}
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-soft">{footer.product}</p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/examples">{footer.examples}</Link></li>
            <li><Link href="/pricing">{footer.pricing}</Link></li>
            <li><Link href="/studio">{footer.create}</Link></li>
            <li><Link href="/occasions">{footer.occasions}</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-soft">{footer.company}</p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/how-it-works">{footer.howItWorks}</Link></li>
            <li><Link href="/faq">{footer.help}</Link></li>
            <li><a href={`mailto:${BRAND.supportEmail}`}>{footer.contact}</a></li>
            <li><Link href="/feedback">{footer.feedback}</Link></li>
            <li><Link href="/reviews">{footer.reviews}</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-soft">{footer.legal}</p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/legal/privacy">{footer.privacy}</Link></li>
            <li><Link href="/legal/terms">{footer.terms}</Link></li>
            <li><Link href="/legal/refunds">{footer.refunds}</Link></li>
          </ul>
          <div className="mt-6 space-y-2">
            <LocaleSwitcher
              current={locale}
              label={messages.language.label}
              names={messages.language.names}
            />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-cream/50 md:px-6">
        © {new Date().getFullYear()} {BRAND.name}. {footer.rights}
      </div>
    </footer>
  );
}

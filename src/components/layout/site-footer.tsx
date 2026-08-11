import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { getLocale } from "@/lib/i18n";
import { LocaleSwitcher } from "./locale-switcher";

export async function SiteFooter() {
  const locale = await getLocale();
  return (
    <footer className="border-t border-border bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="space-y-3 md:col-span-1">
          <p className="font-display text-3xl">{BRAND.name}</p>
          <p className="text-sm text-cream/70">
            Personalized songs crafted from the memories that matter most.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-soft">Product</p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/examples">Examples</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/studio">Create Your Song</Link></li>
            <li><Link href="/occasions">Occasions</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-soft">Company</p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/how-it-works">How It Works</Link></li>
            <li><Link href="/faq">Help Center</Link></li>
            <li><a href={`mailto:${BRAND.supportEmail}`}>Contact</a></li>
            <li><Link href="/reviews">Reviews</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-soft">Legal</p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/legal/privacy">Privacy policy</Link></li>
            <li><Link href="/legal/terms">Terms</Link></li>
            <li><Link href="/legal/refunds">Refund policy</Link></li>
          </ul>
          <div className="mt-6 space-y-2">
            <LocaleSwitcher current={locale} />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-cream/50 md:px-6">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved. Demo content is labeled where used.
      </div>
    </footer>
  );
}

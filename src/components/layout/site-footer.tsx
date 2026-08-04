import Link from "next/link";
import { BRAND, LANGUAGES } from "@/lib/constants";

export function SiteFooter() {
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
            <label className="block text-xs text-cream/60" htmlFor="footer-lang">
              Language
            </label>
            <select
              id="footer-lang"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
              defaultValue="en"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <label className="block text-xs text-cream/60" htmlFor="footer-currency">
              Country / currency
            </label>
            <select
              id="footer-currency"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
              defaultValue="usd"
            >
              <option value="usd">United States · USD</option>
              <option value="eur">Europe · EUR</option>
              <option value="gbp">United Kingdom · GBP</option>
              <option value="cad">Canada · CAD</option>
            </select>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-cream/50 md:px-6">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved. Demo content is labeled where used.
      </div>
    </footer>
  );
}

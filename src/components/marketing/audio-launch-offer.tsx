import Link from "next/link";
import type { Package } from "@/types";
import { formatCurrency } from "@/lib/utils";

const LAUNCH_FEATURES = [
  "Personalized lyrics built from your memories",
  "One complete personalized audio song",
  "Choose genre, mood, vocal style, and language",
  "MP3 download",
  "Private listening and share link",
  "One guided revision",
  "Usually ready within a few minutes",
  "One-time payment — no subscription",
];

export function AudioLaunchOffer({ pkg }: { pkg?: Package }) {
  if (!pkg) return null;

  return (
    <section id="pricing" className="section-pad">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">Launch offer</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
            One personalized audio song. One simple price.
          </h2>
          <p className="mt-4 prose-muted">
            We’re launching Memories to Melody with one focused product: a custom audio song built from the memories that matter most.
          </p>
        </div>

        <article className="surface-card mx-auto mt-9 max-w-xl p-7 md:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-gold">Personalized Audio Song</p>
              <p className="mt-2 text-sm prose-muted">
                A finished song created around your story, ready to listen, download, and share.
              </p>
            </div>
            <div className="text-end">
              <p className="font-display text-5xl text-navy">{formatCurrency(pkg.priceCents, pkg.currency)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-rose">Launch price</p>
            </div>
          </div>

          <ul className="mt-7 grid gap-3 text-sm text-navy/85 sm:grid-cols-2">
            {LAUNCH_FEATURES.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link href={`/studio?package=${pkg.slug}`} className="btn-primary mt-8 w-full justify-center">
            Create Your Song
          </Link>
          <p className="mt-4 text-center text-xs text-muted">Secure checkout · Private by default · Creation starts after payment</p>
        </article>
      </div>
    </section>
  );
}

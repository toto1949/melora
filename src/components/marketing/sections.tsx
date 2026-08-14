"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  ImageIcon,
  Link2,
  LockKeyhole,
  Mic2,
  Music2,
  Play,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { AudioPlayer } from "@/components/player/audio-player";
import { CountUp, Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { OCCASIONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import { Modal } from "@/components/ui/modal";
import type { FaqItem, Package, ReactionVideo, Review, SampleSong, SiteSettings } from "@/types";

export function TrustBar({ settings }: { settings: SiteSettings }) {
  const { messages } = useLocale();
  const copy = messages.trust;
  const stats: Array<{ label: string; value: number; format: (n: number) => string }> = [
    { label: copy.delivery, value: 48, format: (n: number) => `${Math.round(n)}h` },
    {
      label: copy.genres,
      value: settings.genresSupported || 16,
      format: (n: number) => `${Math.round(n)}+`,
    },
    { label: copy.languages, value: 4, format: (n: number) => `${Math.round(n)}` },
    { label: copy.private, value: 100, format: (n: number) => `${Math.round(n)}%` },
  ];
  return (
    <section className="border-y border-border bg-surface">
      <RevealGroup className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:px-6" stagger={0.1}>
        {stats.map((stat) => (
          <RevealItem key={stat.label} className="text-center" y={16}>
            <p className="font-display text-3xl text-navy md:text-4xl">
              <CountUp value={stat.value} format={stat.format} />
            </p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

export function ReactionGallery({ reactions }: { reactions: ReactionVideo[] }) {
  const { messages } = useLocale();
  const copy = messages.reactions;
  const [selected, setSelected] = useState<ReactionVideo | null>(null);
  if (!reactions.length) return null;
  return (
    <>
      <section id="reactions" className="section-pad">
        <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">{copy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-3 prose-muted">
            {copy.body}
          </p>
        </Reveal>
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.09}>
          {reactions.map((rx) => {
            const occasion = messages.occasions.items[rx.occasion as keyof typeof messages.occasions.items]?.name ?? rx.occasion;
            return (
            <RevealItem key={rx.id}>
              <button
                type="button"
                onClick={() => setSelected(rx)}
                className="surface-card card-hover group relative block w-full overflow-hidden text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                aria-label={`${copy.play}: ${rx.customerFirstName}`}
              >
                <div
                  className="aspect-[4/5] bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url(${rx.thumbnailUrl})` }}
                  role="img"
                  aria-label={`${rx.customerFirstName} ${copy.aria} ${occasion}`}
                />
                <span className="absolute start-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface/95 text-navy shadow-lg transition-transform group-hover:scale-110" aria-hidden="true">
                  <Play className="h-5 w-5 fill-current" />
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent px-4 pb-4 pt-14">
                  {rx.quote ? (
                    <p className="font-display text-base italic leading-snug text-cream">
                      &ldquo;{rx.quote}&rdquo;
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gold-soft">
                    {rx.customerFirstName} · {occasion}
                  </p>
                </div>
              </button>
            </RevealItem>
            );
          })}
        </RevealGroup>
        </div>
      </section>
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.customerFirstName} · ${messages.occasions.items[selected.occasion as keyof typeof messages.occasions.items]?.name ?? selected.occasion}` : copy.title}
        closeLabel={copy.close}
      >
        {selected ? (
          <video key={selected.id} controls autoPlay playsInline className="max-h-[70vh] w-full rounded-2xl bg-navy" src={selected.videoUrl}>
            {copy.play}
          </video>
        ) : null}
      </Modal>
    </>
  );
}

export function HowItWorks() {
  const { messages } = useLocale();
  const copy = messages.howItWorks;
  const steps = [
    copy.steps.one,
    copy.steps.two,
    copy.steps.three,
    copy.steps.four,
  ];
  return (
    <section id="how-it-works" className="section-pad bg-surface">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">{copy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
            {copy.title}
          </h2>
        </Reveal>
        <RevealGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" stagger={0.1}>
          {steps.map((step, index) => (
            <RevealItem key={step.title}>
              <article className="surface-card card-hover h-full p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-deep font-display text-xl text-navy">
                  {index + 1}
                </div>
                <h3 className="font-display text-xl text-navy">{step.title}</h3>
                <p className="mt-2 text-sm prose-muted">{step.body}</p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal className="mt-8" delay={0.15}>
          <Link href="/studio" className="btn-primary">
            {copy.start}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function SampleSongsSection({ samples }: { samples: SampleSong[] }) {
  const { messages } = useLocale();
  const copy = messages.examples;
  const [filters, setFilters] = useState({
    occasion: "all",
    genre: "all",
    mood: "all",
    vocalType: "all",
    language: "all",
  });

  const filtered = useMemo(() => {
    return samples.filter((s) => {
      if (filters.occasion !== "all" && s.occasion !== filters.occasion) return false;
      if (filters.genre !== "all" && s.genre !== filters.genre) return false;
      if (filters.mood !== "all" && s.mood !== filters.mood) return false;
      if (filters.vocalType !== "all" && s.vocalType !== filters.vocalType) return false;
      if (filters.language !== "all" && s.language !== filters.language) return false;
      return true;
    });
  }, [filters, samples]);

  const selectClass =
    "rounded-full border border-border bg-surface px-3 py-2 text-sm text-navy";

  return (
    <section id="examples" className="section-pad">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">{copy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">{copy.title}</h2>
          <p className="mt-3 prose-muted">
            {copy.body}
          </p>
        </Reveal>

        <div className="mb-6 flex flex-wrap gap-2">
          <select
            id="filter-occasion"
            className={selectClass}
            value={filters.occasion}
            onChange={(e) => setFilters((f) => ({ ...f, occasion: e.target.value }))}
            aria-label={copy.filterOccasion}
          >
            <option value="all">{copy.allOccasions}</option>
            {[...new Set(samples.map((s) => s.occasion))].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            id="filter-genre"
            className={selectClass}
            value={filters.genre}
            onChange={(e) => setFilters((f) => ({ ...f, genre: e.target.value }))}
            aria-label={copy.filterGenre}
          >
            <option value="all">{copy.allGenres}</option>
            {[...new Set(samples.map((s) => s.genre))].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            id="filter-mood"
            className={selectClass}
            value={filters.mood}
            onChange={(e) => setFilters((f) => ({ ...f, mood: e.target.value }))}
            aria-label={copy.filterMood}
          >
            <option value="all">{copy.allMoods}</option>
            {[...new Set(samples.map((s) => s.mood))].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            id="filter-vocal"
            className={selectClass}
            value={filters.vocalType}
            onChange={(e) => setFilters((f) => ({ ...f, vocalType: e.target.value }))}
            aria-label={copy.filterVocal}
          >
            <option value="all">{copy.allVocals}</option>
            {[...new Set(samples.map((s) => s.vocalType))].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            id="filter-language"
            className={selectClass}
            value={filters.language}
            onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
            aria-label={copy.filterLanguage}
          >
            <option value="all">{copy.allLanguages}</option>
            {[...new Set(samples.map((s) => s.language))].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((sample) => (
            <article key={sample.id} className="surface-card card-hover p-5">
              <AudioPlayer
                id={sample.id}
                src={sample.audioUrl}
                title={sample.title}
                subtitle={`${sample.recipientType} · ${sample.genre} · ${sample.mood}`}
                coverUrl={sample.coverUrl}
              />
              <p className="mt-4 text-sm prose-muted">{sample.lyricsPreview}</p>
              <Link
                href={`/studio?inspiredBy=${sample.slug}`}
                className="btn-secondary mt-4 !w-full"
              >
                {copy.createSimilar}
              </Link>
            </article>
          ))}
          {filtered.length === 0 ? (
            <p className="col-span-full py-10 text-center text-muted">{copy.noResults}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function OccasionsSection() {
  const { messages } = useLocale();
  const copy = messages.occasions;
  return (
    <section id="occasions" className="section-pad bg-surface">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">{copy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
            {copy.title}
          </h2>
        </Reveal>
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
          {OCCASIONS.map((occasion) => (
            <RevealItem key={occasion.slug} className="h-full">
              <Link
                href={`/occasions/${occasion.slug}`}
                className="surface-card card-hover group flex h-full flex-col p-5"
              >
                <h3 className="flex items-center justify-between font-display text-2xl text-navy transition-colors group-hover:text-rose">
                  {copy.items[occasion.slug].name}
                  <ArrowRight className="directional-icon h-5 w-5 -translate-x-1 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 text-sm prose-muted">{copy.items[occasion.slug].description}</p>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export function ProductShowcase({ videoEnabled }: { videoEnabled: boolean }) {
  const { messages } = useLocale();
  const copy = messages.product;
  const items = [
    { icon: Music2, ...copy.items.song },
    { icon: Mic2, ...copy.items.lyrics },
    { icon: Link2, ...copy.items.page },
    { icon: Download, ...copy.items.download },
    { icon: Share2, ...copy.items.share },
    { icon: ImageIcon, ...copy.items.cover },
    videoEnabled
      ? { icon: Sparkles, ...copy.items.video }
      : { icon: Sparkles, ...copy.items.videoLater },
    { icon: Star, ...copy.items.revisions },
  ];
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute -start-24 top-20 h-72 w-72 rounded-full bg-rose-soft/25 blur-3xl" />
      <div className="pointer-events-none absolute -end-24 bottom-16 h-80 w-80 rounded-full bg-gold-soft/25 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.92fr)] lg:gap-16">
        <div className="lg:py-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">{copy.eyebrow}</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl leading-[1.04] text-navy md:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-5 max-w-xl text-base prose-muted md:text-lg">
              {copy.body}
            </p>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.title}
                className="group flex h-full gap-3 rounded-2xl border border-border/90 bg-surface/80 p-4 shadow-[0_10px_30px_rgba(11,20,38,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-surface hover:shadow-soft"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-deep text-gold transition-colors duration-300 group-hover:bg-gold-soft/50 group-hover:text-navy">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold leading-snug text-navy">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
          <Reveal className="mt-7" delay={0.1}>
            <Link href="/studio" className="btn-primary">
              {copy.cta}
              <ArrowRight className="directional-icon h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
        <Reveal className="relative lg:sticky lg:top-28" y={18}>
          <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-rose-soft/35 via-transparent to-gold-soft/35 blur-2xl" />
          <div className="surface-card relative overflow-hidden p-2.5 md:p-3">
            <div className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-muted">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-fill/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-gold-fill/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-navy/20" />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-deep/80 px-2.5 py-1 text-navy">
                <Check className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                {copy.ready}
              </span>
            </div>
            <div className="overflow-hidden rounded-[1.75rem] bg-navy p-5 text-cream shadow-inner sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-soft">{copy.preview}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[0.68rem] font-semibold text-cream/80">
                  <LockKeyhole className="h-3 w-3 text-gold-soft" aria-hidden="true" />
                  {copy.privateBadge}
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-3xl sm:text-4xl">{copy.forAvery}</p>
                  <p className="mt-1 text-sm text-cream/65">{copy.songFrom}</p>
                </div>
                <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-rose-soft sm:block">
                  {copy.nowPlaying}
                </span>
              </div>

              <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-[url('/samples/covers/tomorrows.svg')] bg-cover bg-center shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
                <p className="absolute inset-x-5 bottom-4 font-display text-2xl text-white sm:text-3xl">Tomorrows</p>
              </div>

              <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.055] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-fill text-navy shadow-[0_8px_24px_rgba(201,169,110,0.25)]">
                    <Play className="ms-0.5 h-4 w-4 fill-current" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex h-7 items-end gap-1" aria-hidden="true">
                      {[38, 65, 48, 82, 56, 92, 62, 77, 44, 68, 52, 34, 46, 30].map((height, i) => (
                        <span
                          key={i}
                          className="w-1 rounded-full bg-gradient-to-t from-gold-fill to-rose-fill"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-gold-fill to-rose-fill" />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[0.65rem] tabular-nums text-cream/50">
                      <span>1:14</span>
                      <span>3:18</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-navy/50 px-4 py-3">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-soft">{copy.lyricsLabel}</p>
                  <p className="mt-1.5 font-display text-lg leading-snug text-cream">{copy.lyricLine}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-[17rem] text-xs leading-relaxed text-cream/60">{copy.previewBody}</p>
                  <div className="flex gap-2" aria-hidden="true">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-cream/80">
                      <Download className="h-4 w-4" />
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-cream/80">
                      <Share2 className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Testimonials({ reviews, showEmptyState = false }: { reviews: Review[]; showEmptyState?: boolean }) {
  const { messages } = useLocale();
  const copy = messages.reviews;
  const [visible, setVisible] = useState(3);
  if (reviews.length === 0 && !showEmptyState) return null;
  if (reviews.length === 0) {
    return (
      <section id="reviews" className="section-pad bg-surface">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">{copy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">{copy.emptyTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl prose-muted">
            {copy.emptyBody}
          </p>
          <Link href="/studio" className="btn-primary mt-8 inline-flex">
            {copy.create}
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section id="reviews" className="section-pad bg-surface">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">{copy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">{copy.title}</h2>
        </Reveal>
        <RevealGroup className="grid gap-4 md:grid-cols-3" stagger={0.08}>
          {reviews.slice(0, visible).map((review) => (
            <RevealItem key={review.id} className="h-full">
              <article className="surface-card card-hover flex h-full flex-col p-5">
                <div className="flex text-gold" aria-label={`${review.rating} ${copy.ratingSuffix}`}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm prose-muted">{review.body}</p>
                <div className="mt-5 border-t border-border pt-4 text-sm">
                  <p className="font-semibold text-navy">{review.customerName}</p>
                  <p className="text-muted">
                    {review.occasion} · {review.reviewedAt}
                    {review.isVerifiedPurchase ? ` · ${copy.verified}` : ""}
                  </p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
        {visible < reviews.length ? (
          <button type="button" className="btn-secondary mt-6" onClick={() => setVisible((v) => v + 3)}>
            {copy.loadMore}
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function PricingSection({ packages, videoEnabled }: { packages: Package[]; videoEnabled: boolean }) {
  const { locale, messages } = useLocale();
  const copy = messages.pricing;
  return (
    <section id="pricing" className="section-pad">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">{copy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-3 prose-muted">
            {videoEnabled
              ? copy.bodyVideo
              : copy.bodyNoVideo}
          </p>
        </Reveal>
        <RevealGroup className="grid gap-5 lg:grid-cols-3" stagger={0.12}>
          {packages.map((pkg, index) => {
            const localized = copy.packages[pkg.slug as keyof typeof copy.packages];
            const name = localized?.name ?? pkg.name;
            const description = localized?.description ?? pkg.description;
            const features = localized?.features ?? pkg.features;
            return (
            <RevealItem key={pkg.id} className="h-full">
              <article
                className={`surface-card card-hover relative flex h-full flex-col p-6 ${
                  index === 1 ? "ring-2 ring-gold" : ""
                }`}
              >
                {index === 1 ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-fill px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-navy shadow-md">
                    {copy.popular}
                  </span>
                ) : null}
                <p className="text-sm font-semibold uppercase tracking-wider text-gold">{name}</p>
                <p className="mt-3 font-display text-4xl text-navy">
                  {formatCurrency(pkg.priceCents, pkg.currency, locale)}
                </p>
                <p className="mt-2 text-sm prose-muted">{description}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-navy/85">
                  {features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-gold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/studio?package=${pkg.slug}`} className="btn-primary mt-8">
                  {copy.choose} {name}
                </Link>
              </article>
            </RevealItem>
          );})}
        </RevealGroup>
      </div>
    </section>
  );
}

export function FaqSection({ faqs, viewAllHref }: { faqs: FaqItem[]; viewAllHref?: string }) {
  const { messages } = useLocale();
  const copy = messages.faq;
  const items = faqs.map((faq) => {
    const localized = copy.items[faq.id as keyof typeof copy.items];
    return {
      id: faq.id,
      question: localized?.question ?? faq.question,
      answer: localized?.answer ?? faq.answer,
    };
  });
  return (
    <section id="faq" className="section-pad bg-surface">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">{copy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">{copy.title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion items={items} />
        </Reveal>
        {viewAllHref ? (
          <Reveal delay={0.15} className="mt-8 text-center">
            <Link href={viewAllHref} className="btn-secondary">
              {copy.viewAll}
              <ArrowRight className="directional-icon h-4 w-4" />
            </Link>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export function FinalCta() {
  const { messages } = useLocale();
  const copy = messages.finalCta;
  return (
    <section className="section-pad">
      <Reveal y={32}>
        <div className="atmosphere grain mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border px-6 py-14 text-center md:px-12">
          <h2 className="font-display text-3xl text-navy md:text-5xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl prose-muted">
            {copy.body}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/studio" className="btn-primary group">
              {copy.create}
              <ArrowRight className="directional-icon h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/pricing" className="btn-secondary">
              {copy.packages}
            </Link>
          </div>
          <p className="mt-5 text-sm text-muted">
            {copy.assurance}
          </p>
        </div>
      </Reveal>
    </section>
  );
}

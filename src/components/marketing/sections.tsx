"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Download,
  ImageIcon,
  Link2,
  Mic2,
  Music2,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { AudioPlayer } from "@/components/player/audio-player";
import { CountUp, Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { OCCASIONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { FaqItem, Package, ReactionVideo, Review, SampleSong, SiteSettings } from "@/types";

export function TrustBar({ settings }: { settings: SiteSettings }) {
  const stats = [
    { label: "Songs created", value: settings.songsCreated, format: (n: number) => Math.round(n).toLocaleString() },
    { label: "Average rating", value: settings.averageRating, format: (n: number) => `${n.toFixed(1)} / 5` },
    { label: "Music genres", value: settings.genresSupported, format: (n: number) => `${Math.round(n)}+` },
    { label: "Countries served", value: settings.countriesServed, format: (n: number) => `${Math.round(n)}` },
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
  return (
    <section id="reactions" className="section-pad">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">Reactions</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
            The moment they hear it
          </h2>
          <p className="mt-3 prose-muted">
            A personalized song lands differently than any other gift — here are the moments people remember.
          </p>
        </Reveal>
        <RevealGroup className="flex gap-4 overflow-x-auto pb-2 snap-x" stagger={0.09}>
          {reactions.map((rx) => (
            <RevealItem key={rx.id}>
              <article className="surface-card card-hover min-w-[260px] snap-start overflow-hidden">
                <div
                  className="relative aspect-[4/5] bg-cover bg-center"
                  style={{ backgroundImage: `url(${rx.thumbnailUrl})` }}
                />
                <div className="space-y-1 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold">{rx.occasion}</p>
                  <p className="font-medium text-navy">{rx.customerFirstName}</p>
                  {rx.quote ? <p className="text-sm text-muted">&ldquo;{rx.quote}&rdquo;</p> : null}
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      title: "Tell Us Your Story",
      body: "Share the recipient, occasion, and the memories that make them irreplaceable.",
    },
    {
      title: "Choose Your Sound",
      body: "Pick genre, mood, vocals, and lyric direction—or keep it simple with guided defaults.",
    },
    {
      title: "We Create Your Song",
      body: "Our creative pipeline writes lyrics, produces the song, and prepares your listening page.",
    },
    {
      title: "Listen, Share and Celebrate",
      body: "Reveal the gift, download the audio, and share a private link when the moment is right.",
    },
  ];
  return (
    <section id="how-it-works" className="section-pad bg-surface">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">How it works</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
            Four gentle steps to a song they&apos;ll keep
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
            Start creating
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function SampleSongsSection({ samples }: { samples: SampleSong[] }) {
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
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">Examples</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">Listen before you create</h2>
          <p className="mt-3 prose-muted">
            Songs created with Memories to Melody — a taste of what your story could sound like.
          </p>
        </Reveal>

        <div className="mb-6 flex flex-wrap gap-2">
          <select
            id="filter-occasion"
            className={selectClass}
            value={filters.occasion}
            onChange={(e) => setFilters((f) => ({ ...f, occasion: e.target.value }))}
            aria-label="Filter by occasion"
          >
            <option value="all">All occasions</option>
            {[...new Set(samples.map((s) => s.occasion))].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            id="filter-genre"
            className={selectClass}
            value={filters.genre}
            onChange={(e) => setFilters((f) => ({ ...f, genre: e.target.value }))}
            aria-label="Filter by genre"
          >
            <option value="all">All genres</option>
            {[...new Set(samples.map((s) => s.genre))].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            id="filter-mood"
            className={selectClass}
            value={filters.mood}
            onChange={(e) => setFilters((f) => ({ ...f, mood: e.target.value }))}
            aria-label="Filter by mood"
          >
            <option value="all">All moods</option>
            {[...new Set(samples.map((s) => s.mood))].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            id="filter-vocal"
            className={selectClass}
            value={filters.vocalType}
            onChange={(e) => setFilters((f) => ({ ...f, vocalType: e.target.value }))}
            aria-label="Filter by vocal type"
          >
            <option value="all">All vocals</option>
            {[...new Set(samples.map((s) => s.vocalType))].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            id="filter-language"
            className={selectClass}
            value={filters.language}
            onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
            aria-label="Filter by language"
          >
            <option value="all">All languages</option>
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
                Create Something Like This
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OccasionsSection() {
  return (
    <section id="occasions" className="section-pad bg-surface">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">Occasions</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
            Made for the moments that matter
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
                  {occasion.name}
                  <ArrowRight className="h-5 w-5 -translate-x-1 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 text-sm prose-muted">{occasion.description}</p>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export function ProductShowcase() {
  const items = [
    { icon: Music2, title: "Personalized song", body: "Studio-quality audio shaped around your story." },
    { icon: Mic2, title: "Custom lyrics", body: "Names, memories, and messages woven into the song." },
    { icon: Link2, title: "Private listening page", body: "A beautiful page made for the reveal." },
    { icon: Download, title: "Audio download", body: "Keep an MP3—or WAV on higher packages." },
    { icon: Share2, title: "Shareable link", body: "Secure tokens with privacy controls." },
    { icon: ImageIcon, title: "Cover artwork", body: "A keepsake visual for the song." },
    { icon: Sparkles, title: "Optional videos", body: "Lyric videos and photo music videos." },
    { icon: Star, title: "Revision tools", body: "Request guided changes with credits." },
  ];
  return (
    <section className="section-pad">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">What you receive</p>
            <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
              A complete keepsake, not just a file
            </h2>
          </Reveal>
          <RevealGroup className="mt-8 grid gap-3 sm:grid-cols-2" stagger={0.06}>
            {items.map((item) => (
              <RevealItem key={item.title} className="h-full" y={16}>
                <div className="group h-full rounded-2xl border border-border bg-surface p-4 transition-colors duration-300 hover:border-gold/60">
                  <item.icon className="mb-2 h-5 w-5 text-gold transition-transform duration-300 group-hover:scale-110" />
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
        <div className="surface-card overflow-hidden p-4 md:p-6">
          <div className="rounded-[1.5rem] bg-navy p-5 text-cream shadow-inner">
            <p className="text-xs uppercase tracking-[0.16em] text-gold-soft">Listening page preview</p>
            <p className="mt-3 font-display text-3xl">For Avery</p>
            <p className="mt-1 text-sm text-cream/70">A song from Jordan · Anniversary</p>
            <div className="mt-6 rounded-2xl bg-white/5 p-4">
              <div className="mb-4 aspect-square rounded-2xl bg-[url('/samples/covers/tomorrows.svg')] bg-cover" />
              <div className="waveform" aria-hidden>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
              <p className="mt-4 text-sm text-cream/80">
                Synchronized lyrics, gift reveal mode, downloads, and share controls live here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ reviews }: { reviews: Review[] }) {
  const [visible, setVisible] = useState(3);
  return (
    <section id="reviews" className="section-pad bg-surface">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">Reviews</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">Loved as a gift experience</h2>
        </Reveal>
        <RevealGroup className="grid gap-4 md:grid-cols-3" stagger={0.08}>
          {reviews.slice(0, visible).map((review) => (
            <RevealItem key={review.id} className="h-full">
              <article className="surface-card card-hover flex h-full flex-col p-5">
                <div className="flex text-gold" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm prose-muted">{review.body}</p>
                <div className="mt-5 border-t border-border pt-4 text-sm">
                  <p className="font-semibold text-navy">{review.customerName}</p>
                  <p className="text-muted">
                    {review.occasion} · {review.reviewedAt}
                    {review.isVerifiedPurchase ? " · Verified purchase" : ""}
                  </p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
        {visible < reviews.length ? (
          <button type="button" className="btn-secondary mt-6" onClick={() => setVisible((v) => v + 3)}>
            Load more
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function PricingSection({ packages }: { packages: Package[] }) {
  return (
    <section id="pricing" className="section-pad">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">Pricing</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
            Choose the keepsake that fits
          </h2>
          <p className="mt-3 prose-muted">
            One-time payment, no subscription. Add extras like rush delivery or a photo music video at checkout.
          </p>
        </Reveal>
        <RevealGroup className="grid gap-5 lg:grid-cols-3" stagger={0.12}>
          {packages.map((pkg, index) => (
            <RevealItem key={pkg.id} className="h-full">
              <article
                className={`surface-card card-hover relative flex h-full flex-col p-6 ${
                  index === 1 ? "ring-2 ring-gold" : ""
                }`}
              >
                {index === 1 ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-navy shadow-md">
                    Most popular
                  </span>
                ) : null}
                <p className="text-sm font-semibold uppercase tracking-wider text-gold">{pkg.name}</p>
                <p className="mt-3 font-display text-4xl text-navy">
                  {formatCurrency(pkg.priceCents, pkg.currency)}
                </p>
                <p className="mt-2 text-sm prose-muted">{pkg.description}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-navy/85">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-gold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/studio?package=${pkg.slug}`} className="btn-primary mt-8">
                  Choose {pkg.name}
                </Link>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section id="faq" className="section-pad bg-surface">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">FAQ</p>
          <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">Questions, answered calmly</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="section-pad">
      <Reveal y={32}>
        <div className="atmosphere grain mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border px-6 py-14 text-center md:px-12">
          <h2 className="font-display text-3xl text-navy md:text-5xl">
            Ready to give them a song they&apos;ll keep forever?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl prose-muted">
            Most customers finish the studio in under five minutes. Secure checkout, private delivery, and revision support when you need it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/studio" className="btn-primary group">
              Create Their Song
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/pricing" className="btn-secondary">
              View packages
            </Link>
          </div>
          <p className="mt-5 text-sm text-muted">
            Satisfaction-minded guarantee · Encrypted payments via Stripe
          </p>
        </div>
      </Reveal>
    </section>
  );
}

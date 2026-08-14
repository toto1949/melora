"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, Music2, Music4 } from "lucide-react";
import { AudioPlayer } from "@/components/player/audio-player";
import { useLocale } from "@/components/i18n/locale-provider";
import type { SiteSettings } from "@/types";

const EASE = [0.22, 1, 0.36, 1] as const;

function rise(delay: number) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  };
}

export function Hero({ settings }: { settings: SiteSettings }) {
  const reduced = useReducedMotion();
  const { locale, messages } = useLocale();
  const copy = messages.hero;
  return (
    <section className="atmosphere grain relative overflow-hidden">
      {/* Floating decorative notes */}
      {!reduced ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <Music2 className="float-slow absolute left-[6%] top-[18%] h-8 w-8 text-gold/30" />
          <Music4 className="float-slower absolute right-[10%] top-[10%] h-10 w-10 text-rose/25" />
          <Heart className="float-slow absolute bottom-[16%] left-[42%] h-6 w-6 text-rose/30 [animation-delay:1.4s]" />
          <div className="float-slower absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-rose/10 blur-3xl" />
          <div className="float-slow absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:px-6 md:pb-24 md:pt-16">
        <div>
          <motion.p
            {...rise(0)}
            className="mb-4 inline-flex rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-navy/70"
          >
            {locale === "en" ? settings.trustBadge : copy.trustBadge}
          </motion.p>
          <motion.h1
            {...rise(0.08)}
            className="font-display text-4xl leading-[1.05] text-navy sm:text-5xl md:text-6xl"
          >
            <span className="block text-gold">{settings.brandName}</span>
            <span className="mt-3 block">{locale === "en" ? settings.heroHeadline : copy.headline}</span>
          </motion.h1>
          <motion.p {...rise(0.16)} className="mt-5 max-w-xl text-base prose-muted md:text-lg">
            {locale === "en" ? settings.heroSupporting : copy.supporting}
          </motion.p>
          <motion.div {...rise(0.24)} className="mt-8 flex flex-wrap gap-3">
            <Link href="/studio" className="btn-primary group">
              {copy.create}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/examples" className="btn-secondary">
              {copy.listen}
            </Link>
          </motion.div>
          <motion.p {...rise(0.32)} className="mt-5 text-sm text-muted">
            {copy.assurance}
          </motion.p>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: EASE }}
          className="space-y-4"
        >
          <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-navy p-2 shadow-[var(--shadow-lift)]">
            <div className="relative overflow-hidden rounded-[1.6rem]">
              <div
                className="aspect-[4/3] bg-cover bg-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                style={{ backgroundImage: "url('/samples/hero-lifestyle.jpg')" }}
                role="img"
                aria-label={copy.imageAlt}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent px-6 pb-5 pt-16">
                <p className="font-display text-xl italic text-cream md:text-2xl">
                  {copy.imageTitle}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold-soft">
                  {copy.imageEyebrow}
                </p>
              </div>
            </div>
          </div>
          <AudioPlayer
            id="hero-demo"
            src="https://files.kunavo.com/audio/2026-08/sF7SbcF5E8KuUu9hVwV7T/0m00jwd8s3cxrfme083i.mp3"
            title="Golden Hour With You"
            subtitle={copy.demoSubtitle}
            coverUrl="https://files.kunavo.com/image/2026-08/sF7SbcF5E8KuUu9hVwV7T/erfs8t1tagqc1fj5dlbw.jpg"
          />
        </motion.div>
      </div>
    </section>
  );
}

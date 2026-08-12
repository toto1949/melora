"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AudioPlayer } from "@/components/player/audio-player";
import type { SiteSettings } from "@/types";

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="atmosphere grain relative overflow-hidden">
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:px-6 md:pb-24 md:pt-16">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-navy/70"
          >
            {settings.trustBadge}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="font-display text-4xl leading-[1.05] text-navy sm:text-5xl md:text-6xl"
          >
            <span className="block text-gold">{settings.brandName}</span>
            <span className="mt-3 block">{settings.heroHeadline}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-5 max-w-xl text-base prose-muted md:text-lg"
          >
            {settings.heroSupporting}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/studio" className="btn-primary">
              Create Your Song
            </Link>
            <Link href="/examples" className="btn-secondary">
              Listen to Examples
            </Link>
          </motion.div>
          <p className="mt-5 text-sm text-muted">
            Typically ready within 48 hours · Satisfaction-minded revision support · Secure checkout
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-4"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-navy p-2 shadow-[var(--shadow-lift)]">
            <div
              className="aspect-[4/3] rounded-[1.6rem] bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(11,20,38,0.15), rgba(196,132,138,0.28)), url('/samples/hero-lifestyle.svg')",
              }}
              role="img"
              aria-label="Warm lifestyle scene representing a personal song gift moment"
            />
          </div>
          <AudioPlayer
            id="hero-demo"
            src="https://files.kunavo.com/audio/2026-08/sF7SbcF5E8KuUu9hVwV7T/0m00jwd8s3cxrfme083i.mp3"
            title="Golden Hour With You"
            subtitle="Anniversary · Acoustic · Created with Memories to Melody"
            coverUrl="https://files.kunavo.com/image/2026-08/sF7SbcF5E8KuUu9hVwV7T/erfs8t1tagqc1fj5dlbw.jpg"
          />
        </motion.div>
      </div>
    </section>
  );
}

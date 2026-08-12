"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Maximize2, QrCode, Share2 } from "lucide-react";
import { AudioPlayer } from "@/components/player/audio-player";
import type { Order, SongVersion } from "@/types";

export function ListenExperience({
  order,
  version,
  canManage,
}: {
  order: Order;
  version: SongVersion | null;
  canManage: boolean;
}) {
  const [revealed, setRevealed] = useState(!order.giftRevealEnabled);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const dedication = order.project?.recipient
    ? `For ${order.project.recipient.name}${
        order.project.recipient.fromName ? ` · From ${order.project.recipient.fromName}` : ""
      }`
    : "A personalized song from Memories to Melody";

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 overflow-auto bg-navy text-cream" : ""}>
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="atmosphere grain flex min-h-[70vh] items-center justify-center px-4 py-16"
          >
            <div className="surface-card max-w-lg p-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">A private gift</p>
              <h1 className="mt-4 font-display text-4xl text-navy">
                {order.giftRevealMessage || "Someone created something special for you."}
              </h1>
              <button type="button" className="btn-primary mt-8" onClick={() => setRevealed(true)}>
                Reveal the song
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="song"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={fullscreen ? "px-4 py-10" : "section-pad"}
          >
            <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div
                  className="aspect-square overflow-hidden rounded-[2rem] bg-cover bg-center shadow-[var(--shadow-lift)]"
                  style={{
                    backgroundImage: `url(${version?.coverUrl || "/samples/covers/generated.svg"})`,
                  }}
                  role="img"
                  aria-label="Song cover artwork"
                />
                <div className="flex flex-wrap gap-2">
                  {version?.audioUrl ? (
                    <a className="btn-secondary !py-2" href={version.audioUrl} download>
                      <Download className="h-4 w-4" /> Download
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="btn-secondary !py-2"
                    onClick={async () => {
                      await navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy link"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary !py-2"
                    onClick={async () => {
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: version?.title || "Memories to Melody song",
                            url: window.location.href,
                          });
                        } else {
                          // No native share sheet (desktop) — copy instead.
                          await navigator.clipboard.writeText(window.location.href);
                          setShared(true);
                          setTimeout(() => setShared(false), 1500);
                        }
                      } catch {
                        // User dismissed the share sheet — nothing to do.
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" /> {shared ? "Link copied" : "Share"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary !py-2"
                    onClick={() => setFullscreen((v) => !v)}
                  >
                    <Maximize2 className="h-4 w-4" /> {fullscreen ? "Exit" : "Full screen"}
                  </button>
                </div>
              </div>

              <div className={fullscreen ? "text-cream" : ""}>
                <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${fullscreen ? "text-gold-soft" : "text-gold"}`}>
                  {order.project?.occasion || "Personalized song"}
                </p>
                <h1 className={`mt-2 font-display text-4xl md:text-5xl ${fullscreen ? "text-cream" : "text-navy"}`}>
                  {version?.title || "Your personalized song"}
                </h1>
                <p className={`mt-2 ${fullscreen ? "text-cream/70" : "text-muted"}`}>{dedication}</p>

                {version?.audioUrl ? (
                  <div className="mt-6">
                    <AudioPlayer
                      id={`listen-${order.id}`}
                      src={version.audioUrl}
                      title={version.title}
                      subtitle={`${version.genre || ""} · ${version.mood || ""}`}
                      coverUrl={version.coverUrl || undefined}
                    />
                  </div>
                ) : (
                  <div className="surface-card mt-6 p-6 text-sm text-muted">
                    Your song is still being created. Status: {order.status.replaceAll("_", " ")}
                    {typeof order.progress === "number" ? ` · ${order.progress}%` : ""}
                  </div>
                )}

                {version?.lyrics ? (
                  <div className="mt-8">
                    <h2 className={`font-display text-2xl ${fullscreen ? "text-cream" : "text-navy"}`}>Lyrics</h2>
                    <pre className={`mt-3 whitespace-pre-wrap font-sans text-sm leading-7 ${fullscreen ? "text-cream/80" : "text-navy/80"}`}>
                      {version.lyrics}
                    </pre>
                    {version.timedLyrics?.length ? (
                      <details className="mt-4 text-sm">
                        <summary className="cursor-pointer font-semibold">Transcript / timed lyrics</summary>
                        <ul className="mt-2 space-y-1 text-muted">
                          {version.timedLyrics.map((line, i) => (
                            <li key={i}>
                              [{line.start.toFixed(1)}s] {line.text}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                ) : null}

                {canManage ? (
                  <div className={`mt-8 rounded-3xl border p-4 text-sm ${fullscreen ? "border-white/15 text-cream/70" : "border-border text-muted"}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      <QrCode className="h-4 w-4" /> Sharing
                    </div>
                    {shareUrl ? <p className="mt-2 break-all">{shareUrl}</p> : null}
                    <p className="mt-2 capitalize">Privacy: {order.privacyMode}</p>
                    <p className="mt-2">Manage privacy and revisions from your dashboard order page.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

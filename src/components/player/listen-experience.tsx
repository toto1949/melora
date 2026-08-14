"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Maximize2, QrCode, Share2 } from "lucide-react";
import { AudioPlayer } from "@/components/player/audio-player";
import { VideoPlayer } from "@/components/player/video-player";
import type { Order, SongVersion } from "@/types";
import { useLocale } from "@/components/i18n/locale-provider";

const REFRESH_INTERVAL_MS = 5_000;

export function ListenExperience({
  order,
  version,
  canManage,
  videoEnabled,
}: {
  order: Order;
  version: SongVersion | null;
  canManage: boolean;
  videoEnabled: boolean;
}) {
  const { locale, messages } = useLocale();
  const copy = messages.listen;
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(!order.giftRevealEnabled);
  const [fullscreen, setFullscreen] = useState(false);
  const [copyState, setCopyState] = useState<"copied" | "failed" | null>(null);
  const [shared, setShared] = useState(false);
  const processing = !version?.audioUrl && !["failed", "refunded"].includes(order.status);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  useEffect(() => {
    if (!processing) return;
    const timer = window.setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [processing, router]);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", onKeyDown);
    if (fullscreen) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  const toggleFullscreen = async () => {
    if (fullscreen) {
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      setFullscreen(false);
      return;
    }
    if (rootRef.current?.requestFullscreen) {
      await rootRef.current.requestFullscreen().catch(() => undefined);
    }
    setFullscreen(true);
  };

  const dedication = order.project?.recipient
    ? `${copy.for} ${order.project.recipient.name}${
        order.project.recipient.fromName ? ` · ${copy.from} ${order.project.recipient.fromName}` : ""
      }`
    : copy.dedication;

  const statusLabel = copy.statuses[order.status as keyof typeof copy.statuses] ?? order.status.replaceAll("_", " ");
  const estimatedDelivery = order.estimatedDeliveryAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.estimatedDeliveryAt))
    : null;

  return (
    <div
      ref={rootRef}
      className={fullscreen ? "fixed inset-0 z-50 overflow-auto bg-navy text-cream" : ""}
      role={fullscreen ? "dialog" : undefined}
      aria-modal={fullscreen ? true : undefined}
      aria-label={fullscreen ? copy.fullscreen : undefined}
    >
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">{copy.privateGift}</p>
              <h1 className="mt-4 font-display text-4xl text-navy">
                {order.giftRevealMessage || copy.defaultReveal}
              </h1>
              <button type="button" className="btn-primary mt-8" onClick={() => setRevealed(true)}>
                {copy.reveal}
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
                  aria-label={copy.coverAlt}
                />
                <div className="flex flex-wrap gap-2">
                  {version?.audioUrl ? (
                    <a className="btn-secondary !py-2" href={version.audioUrl} download>
                      <Download className="h-4 w-4" /> {copy.download}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="btn-secondary !py-2"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        setCopyState("copied");
                      } catch {
                        setCopyState("failed");
                      }
                      setTimeout(() => setCopyState(null), 1800);
                    }}
                  >
                    <Copy className="h-4 w-4" /> {copyState === "copied" ? copy.copied : copyState === "failed" ? copy.copyFailed : copy.copyLink}
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
                    <Share2 className="h-4 w-4" /> {shared ? copy.linkCopied : copy.share}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary !py-2"
                    onClick={toggleFullscreen}
                  >
                    <Maximize2 className="h-4 w-4" /> {fullscreen ? copy.exitFullscreen : copy.fullscreen}
                  </button>
                </div>
              </div>

              <div className={fullscreen ? "text-cream" : ""}>
                <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${fullscreen ? "text-gold-soft" : "text-gold"}`}>
                  {order.project?.occasion || copy.personalizedSong}
                </p>
                <h1 className={`mt-2 font-display text-4xl md:text-5xl ${fullscreen ? "text-cream" : "text-navy"}`}>
                  {version?.title || copy.yourSong}
                </h1>
                <p className={`mt-2 ${fullscreen ? "text-cream/70" : "text-muted"}`}>{dedication}</p>

                {videoEnabled && version?.videoUrl ? (
                  <div className="mt-6">
                    <VideoPlayer
                      src={version.videoUrl}
                      poster={version.coverUrl || undefined}
                      title={version.title}
                    />
                  </div>
                ) : null}

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
                  <div className="surface-card mt-6 p-6 text-sm text-muted" aria-live="polite" role="status">
                    {order.status === "failed" ? (
                      <div>
                        <p className="font-semibold text-navy">{copy.failedTitle}</p>
                        <p className="mt-2">{canManage ? copy.failedOwner : copy.failedRecipient}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {canManage ? <Link href={`/dashboard/orders/${order.id}`} className="btn-primary !py-2">{copy.openDashboard}</Link> : null}
                          <a href="mailto:hello@memoriestomelody.com" className="btn-secondary !py-2">{copy.contactSupport}</a>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-semibold text-navy">{copy.processingTitle}</p>
                          <p className="font-medium text-navy">{statusLabel} · {order.progress ?? 0}%</p>
                        </div>
                        <div
                          className="mt-4 h-2 overflow-hidden rounded-full bg-cream-deep"
                          role="progressbar"
                          aria-label={copy.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={order.progress ?? 0}
                        >
                          <div className="h-full rounded-full bg-gradient-to-r from-rose-fill to-gold-fill transition-[width]" style={{ width: `${order.progress ?? 0}%` }} />
                        </div>
                        <p className="mt-3">{copy.processingBody}</p>
                        {estimatedDelivery ? <p className="mt-2 text-xs">{copy.estimated}: {estimatedDelivery}</p> : null}
                        <p className="mt-2 text-xs" aria-hidden="true">{copy.refreshing}</p>
                      </div>
                    )}
                  </div>
                )}

                {version?.lyrics ? (
                  <div className="mt-8">
                    <h2 className={`font-display text-2xl ${fullscreen ? "text-cream" : "text-navy"}`}>{copy.lyrics}</h2>
                    <pre className={`mt-3 whitespace-pre-wrap font-sans text-sm leading-7 ${fullscreen ? "text-cream/80" : "text-navy/80"}`}>
                      {version.lyrics}
                    </pre>
                    {version.timedLyrics?.length ? (
                      <details className="mt-4 text-sm">
                        <summary className="cursor-pointer font-semibold">{copy.timedLyrics}</summary>
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
                      <QrCode className="h-4 w-4" /> {copy.sharing}
                    </div>
                    {shareUrl ? <p className="mt-2 break-all">{shareUrl}</p> : null}
                    <p className="mt-2 capitalize">{copy.privacy}: {order.privacyMode}</p>
                    <p className="mt-2">{copy.manage}</p>
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

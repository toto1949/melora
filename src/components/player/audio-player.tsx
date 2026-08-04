"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

let activePlayerId: string | null = null;
const listeners = new Set<() => void>();

function notifyPlayers() {
  listeners.forEach((l) => l());
}

export function AudioPlayer({
  id,
  src,
  title,
  subtitle,
  coverUrl,
  className,
  compact = false,
}: {
  id: string;
  src: string;
  title: string;
  subtitle?: string;
  coverUrl?: string;
  className?: string;
  compact?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);

  useEffect(() => {
    const sync = () => {
      if (activePlayerId !== id && playing) {
        audioRef.current?.pause();
        setPlaying(false);
      }
    };
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, [id, playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    activePlayerId = id;
    notifyPlayers();
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <div
      className={cn(
        "surface-card relative overflow-hidden p-4 md:p-5",
        compact ? "flex items-center gap-3" : "space-y-4",
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />

      <div className={cn("flex items-center gap-4", !compact && "w-full")}>
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="h-16 w-16 rounded-2xl object-cover shadow-md md:h-20 md:w-20"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg text-navy">{title}</p>
          {subtitle ? <p className="truncate text-sm text-muted">{subtitle}</p> : null}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy text-cream"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </button>
            <div className="waveform aria-hidden" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} style={{ height: playing ? undefined : `${30 + (i % 4) * 12}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="sr-only" htmlFor={`${id}-seek`}>
          Seek
        </label>
        <input
          id={`${id}-seek`}
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={progress}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (audioRef.current) audioRef.current.currentTime = value;
            setProgress(value);
          }}
          className="w-full accent-gold"
        />
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{formatDuration(progress)}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => {
                const next = !muted;
                setMuted(next);
                if (audioRef.current) audioRef.current.muted = next;
              }}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(e) => {
                const value = Number(e.target.value);
                setVolume(value);
                setMuted(value === 0);
                if (audioRef.current) {
                  audioRef.current.volume = value;
                  audioRef.current.muted = value === 0;
                }
              }}
              className="w-20 accent-gold"
            />
            <span>{formatDuration(duration || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getEnv } from "@/lib/env";
import { sleep } from "@/lib/utils";
import type { MusicProvider, MusicResult } from "../types";

const KUNAVO_JOBS_URL = "https://api.kunavo.com/v1/audio/music/jobs";

// Suno V5.5 custom-mode limits (see kunavo.com/docs/music).
const MAX_LYRICS_CHARS = 5000;
const MAX_STYLE_CHARS = 900;
const MAX_TITLE_CHARS = 80;

// Leave headroom under the route's 300s maxDuration; on timeout the job
// worker retries and the Idempotency-Key resumes this same generation.
const POLL_DEADLINE_MS = 210_000;
const POLL_INTERVAL_MS = 10_000;

interface KunavoTrack {
  url?: string;
  stream_url?: string;
  image_url?: string;
}

interface KunavoJob {
  id: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  output?: { tracks?: KunavoTrack[] } | null;
  error?: { code?: string; message?: string } | null;
}

export class KunavoMusicProvider implements MusicProvider {
  name = "kunavo-suno";

  async generateMusic(input: {
    brief: { genre: string; mood: string; vocalType: string };
    lyrics: string;
    title: string;
    idempotencyKey?: string;
    onProviderJobId?: (providerJobId: string) => void | Promise<void>;
  }): Promise<MusicResult> {
    const env = getEnv();
    const apiKey = env.MUSIC_PROVIDER_API_KEY;
    if (!apiKey) {
      throw new Error("MUSIC_PROVIDER_API_KEY is not configured");
    }

    const style = `${input.brief.genre}, ${input.brief.mood} mood, ${input.brief.vocalType} vocal`.slice(0, MAX_STYLE_CHARS);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
    if (input.idempotencyKey) {
      headers["Idempotency-Key"] = input.idempotencyKey.slice(0, 128);
    }

    // customMode makes Suno sing the prompt verbatim as lyrics; without it
    // Suno improvises its own lyrics from the description and the displayed
    // lyrics would not match the audio.
    const submitRes = await fetch(env.MUSIC_PROVIDER_URL || KUNAVO_JOBS_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "suno-v5-5",
        customMode: true,
        prompt: input.lyrics.slice(0, MAX_LYRICS_CHARS),
        style,
        title: input.title.slice(0, MAX_TITLE_CHARS),
        instrumental: false,
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!submitRes.ok) {
      const body = await submitRes.text().catch(() => "");
      throw new Error(`Kunavo submit failed (${submitRes.status}): ${body.slice(0, 300)}`);
    }

    let job = (await submitRes.json()) as KunavoJob;
    if (!job.id) throw new Error("Kunavo returned no job id");
    await input.onProviderJobId?.(job.id);
    const deadline = Date.now() + POLL_DEADLINE_MS;
    while (job.status !== "completed" && job.status !== "failed") {
      if (Date.now() > deadline) {
        throw new Error(`Kunavo generation still ${job.status} after ${Math.round(POLL_DEADLINE_MS / 1000)}s; will resume on retry`);
      }
      await sleep(POLL_INTERVAL_MS);
      const pollRes = await fetch(`${KUNAVO_JOBS_URL}/${job.id}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(30_000),
      });
      if (!pollRes.ok) continue;
      job = (await pollRes.json()) as KunavoJob;
    }

    if (job.status === "failed") {
      throw new Error(`Kunavo generation failed: ${job.error?.message ?? "unknown error"}`);
    }

    const tracks = job.output?.tracks ?? [];
    const track = tracks[0];
    const audioUrl = track?.url ?? track?.stream_url;
    if (!audioUrl) {
      throw new Error("Kunavo returned no audio track");
    }

    return {
      audioUrl,
      durationSeconds: 180,
      format: "mp3",
      provider: this.name,
      providerJobId: job.id,
      coverUrl: track?.image_url,
      alternateAudioUrls: tracks
        .slice(1)
        .map((t) => t.url ?? t.stream_url)
        .filter((u): u is string => Boolean(u)),
    };
  }
}

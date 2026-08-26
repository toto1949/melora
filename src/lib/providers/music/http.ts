import { getEnv } from "@/lib/env";
import type { MusicProvider, MusicResult } from "../types";

export class HttpMusicProvider implements MusicProvider {
  name = "http-music";

  async generateMusic(input: {
    brief: { genre: string; mood: string; vocalType: string };
    lyrics: string;
    title: string;
    idempotencyKey?: string;
    onProviderJobId?: (providerJobId: string) => void | Promise<void>;
    onProgress?: (progress: number) => void | Promise<void>;
  }): Promise<MusicResult> {
    const env = getEnv();
    if (!env.MUSIC_PROVIDER_URL) {
      throw new Error("MUSIC_PROVIDER_URL is not configured");
    }

    await input.onProgress?.(30);
    const res = await fetch(env.MUSIC_PROVIDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.MUSIC_PROVIDER_API_KEY
          ? { Authorization: `Bearer ${env.MUSIC_PROVIDER_API_KEY}` }
          : {}),
        ...(input.idempotencyKey
          ? { "Idempotency-Key": input.idempotencyKey.slice(0, 128) }
          : {}),
      },
      body: JSON.stringify({
        title: input.title,
        lyrics: input.lyrics,
        genre: input.brief.genre,
        mood: input.brief.mood,
        vocal_type: input.brief.vocalType,
      }),
      signal: AbortSignal.timeout(210_000),
    });

    if (!res.ok) {
      throw new Error(`Music provider failed (${res.status})`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const providerJobId = String(data.jobId ?? data.job_id ?? "");
    if (providerJobId) await input.onProviderJobId?.(providerJobId);
    await input.onProgress?.(70);
    const audioUrl = String(data.audioUrl ?? data.audio_url ?? "");
    if (!audioUrl) throw new Error("Music provider returned no audio URL");
    return {
      audioUrl,
      durationSeconds: Number(data.durationSeconds ?? data.duration_seconds ?? 180),
      format: (data.format as "mp3" | "wav") ?? "mp3",
      provider: this.name,
      providerJobId: providerJobId || undefined,
    };
  }
}

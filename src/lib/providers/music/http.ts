import { getEnv } from "@/lib/env";
import type { MusicProvider, MusicResult } from "../types";

export class HttpMusicProvider implements MusicProvider {
  name = "http-music";

  async generateMusic(input: {
    brief: { genre: string; mood: string; vocalType: string };
    lyrics: string;
    title: string;
  }): Promise<MusicResult> {
    const env = getEnv();
    if (!env.MUSIC_PROVIDER_URL) {
      throw new Error("MUSIC_PROVIDER_URL is not configured");
    }

    const res = await fetch(env.MUSIC_PROVIDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.MUSIC_PROVIDER_API_KEY
          ? { Authorization: `Bearer ${env.MUSIC_PROVIDER_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        title: input.title,
        lyrics: input.lyrics,
        genre: input.brief.genre,
        mood: input.brief.mood,
        vocal_type: input.brief.vocalType,
      }),
    });

    if (!res.ok) {
      throw new Error(`Music provider failed (${res.status})`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    return {
      audioUrl: String(data.audioUrl ?? data.audio_url ?? ""),
      durationSeconds: Number(data.durationSeconds ?? data.duration_seconds ?? 180),
      format: (data.format as "mp3" | "wav") ?? "mp3",
      provider: this.name,
      providerJobId: String(data.jobId ?? data.job_id ?? ""),
    };
  }
}

import { getEnv } from "@/lib/env";
import type { MusicProvider, MusicResult } from "../types";

const KUNAVO_MUSIC_URL = "https://api.kunavo.com/v1/audio/music";

interface KunavoTrack {
  url?: string;
  audio_url?: string;
  duration?: number;
  duration_seconds?: number;
  id?: string;
}

export class KunavoMusicProvider implements MusicProvider {
  name = "kunavo-suno";

  async generateMusic(input: {
    brief: { genre: string; mood: string; vocalType: string };
    lyrics: string;
    title: string;
  }): Promise<MusicResult> {
    const env = getEnv();
    if (!env.MUSIC_PROVIDER_API_KEY) {
      throw new Error("MUSIC_PROVIDER_API_KEY is not configured");
    }

    const style = `${input.brief.genre}, ${input.brief.mood} mood, ${input.brief.vocalType} vocal`;

    const res = await fetch(env.MUSIC_PROVIDER_URL || KUNAVO_MUSIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.MUSIC_PROVIDER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "suno-v5-5",
        prompt: style,
        lyrics: input.lyrics,
        style,
        title: input.title,
      }),
      signal: AbortSignal.timeout(280_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Kunavo music generation failed (${res.status}): ${body.slice(0, 300)}`);
    }

    const payload = (await res.json()) as { data?: KunavoTrack[] };
    const track = payload.data?.[0];
    const audioUrl = track?.url ?? track?.audio_url;
    if (!audioUrl) {
      throw new Error("Kunavo returned no audio track");
    }

    return {
      audioUrl,
      durationSeconds: Math.round(track?.duration ?? track?.duration_seconds ?? 180),
      format: "mp3",
      provider: this.name,
      providerJobId: track?.id,
    };
  }
}

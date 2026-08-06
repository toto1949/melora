import { getEnv } from "@/lib/env";
import type { VideoProvider, VideoResult } from "../types";

export class HttpVideoProvider implements VideoProvider {
  name = "http-video";

  async generateVideo(input: {
    title: string;
    audioUrl: string;
    style: string;
    photoUrls: string[];
    lyrics?: string;
  }): Promise<VideoResult> {
    const env = getEnv();
    if (!env.VIDEO_PROVIDER_URL) {
      throw new Error("VIDEO_PROVIDER_URL is not configured");
    }

    const res = await fetch(env.VIDEO_PROVIDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.VIDEO_PROVIDER_API_KEY
          ? { Authorization: `Bearer ${env.VIDEO_PROVIDER_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        title: input.title,
        audio_url: input.audioUrl,
        style: input.style,
        photo_urls: input.photoUrls,
        lyrics: input.lyrics,
      }),
    });

    if (!res.ok) {
      throw new Error(`Video provider failed (${res.status})`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    return {
      videoUrl: String(data.videoUrl ?? data.video_url ?? ""),
      durationSeconds: Number(data.durationSeconds ?? data.duration_seconds ?? 180),
      provider: this.name,
      style: input.style,
    };
  }
}

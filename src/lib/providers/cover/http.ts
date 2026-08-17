import { getEnv } from "@/lib/env";
import type { CoverArtProvider, CoverArtResult } from "../types";

export class HttpCoverArtProvider implements CoverArtProvider {
  name = "http-cover";

  async generateCover(input: {
    title: string;
    occasion: string;
    genre: string;
    mood: string;
  }): Promise<CoverArtResult> {
    const env = getEnv();
    if (!env.COVER_PROVIDER_URL) {
      throw new Error("COVER_PROVIDER_URL is not configured");
    }

    const response = await fetch(env.COVER_PROVIDER_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(env.COVER_PROVIDER_API_KEY
          ? { authorization: `Bearer ${env.COVER_PROVIDER_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      throw new Error(`Cover provider failed (${response.status})`);
    }
    const data = (await response.json()) as Record<string, unknown>;
    const imageUrl = String(data.imageUrl ?? data.image_url ?? "");
    if (!imageUrl) throw new Error("Cover provider returned no image URL");
    return { imageUrl, provider: this.name };
  }
}

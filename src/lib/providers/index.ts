import { getEnv } from "@/lib/env";
import { MockCoverArtProvider } from "./cover/mock";
import { MockLyricsProvider } from "./lyrics/mock";
import { OpenAICompatibleLyricsProvider } from "./lyrics/openai";
import { MockMusicProvider } from "./music/mock";
import { MockVideoProvider } from "./video/mock";
import type {
  CoverArtProvider,
  LyricsProvider,
  MusicProvider,
  VideoProvider,
} from "./types";

export function getLyricsProvider(): LyricsProvider {
  const env = getEnv();
  if (env.LYRICS_PROVIDER === "openai" || env.OPENAI_API_KEY) {
    return new OpenAICompatibleLyricsProvider();
  }
  return new MockLyricsProvider();
}

export function getMusicProvider(): MusicProvider {
  // Swap this adapter for Suno/Udio/custom HTTP providers without touching UI.
  return new MockMusicProvider();
}

export function getVideoProvider(): VideoProvider {
  return new MockVideoProvider();
}

export function getCoverArtProvider(): CoverArtProvider {
  return new MockCoverArtProvider();
}

export * from "./types";

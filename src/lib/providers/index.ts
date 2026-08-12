import { getEnv, isMockMode } from "@/lib/env";
import { MockCoverArtProvider } from "./cover/mock";
import { MockLyricsProvider } from "./lyrics/mock";
import { OpenAICompatibleLyricsProvider } from "./lyrics/openai";
import { HttpMusicProvider } from "./music/http";
import { KunavoMusicProvider } from "./music/kunavo";
import { MockMusicProvider } from "./music/mock";
import { HttpVideoProvider } from "./video/http";
import { MockVideoProvider } from "./video/mock";
import type {
  CoverArtProvider,
  LyricsProvider,
  MusicProvider,
  VideoProvider,
} from "./types";

export function getLyricsProvider(): LyricsProvider {
  const env = getEnv();
  if (!isMockMode() && (env.LYRICS_PROVIDER === "openai" || env.OPENAI_API_KEY)) {
    return new OpenAICompatibleLyricsProvider();
  }
  return new MockLyricsProvider();
}

export function getMusicProvider(): MusicProvider {
  const env = getEnv();
  if (!isMockMode() && env.MUSIC_PROVIDER === "kunavo" && env.MUSIC_PROVIDER_API_KEY) {
    return new KunavoMusicProvider();
  }
  if (!isMockMode() && env.MUSIC_PROVIDER === "http" && env.MUSIC_PROVIDER_URL) {
    return new HttpMusicProvider();
  }
  return new MockMusicProvider();
}

export function getVideoProvider(): VideoProvider {
  const env = getEnv();
  if (!isMockMode() && env.VIDEO_PROVIDER === "http" && env.VIDEO_PROVIDER_URL) {
    return new HttpVideoProvider();
  }
  return new MockVideoProvider();
}

export function getCoverArtProvider(): CoverArtProvider {
  return new MockCoverArtProvider();
}

export * from "./types";

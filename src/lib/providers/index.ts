import { getEnv, isMockMode } from "@/lib/env";
import { MockCoverArtProvider } from "./cover/mock";
import { HttpCoverArtProvider } from "./cover/http";
import { BuiltInCoverArtProvider } from "./cover/builtin";
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
  if (isMockMode()) return new MockLyricsProvider();
  throw new Error(`Lyrics provider is not configured: ${env.LYRICS_PROVIDER}`);
}

export function getMusicProvider(): MusicProvider {
  const env = getEnv();
  if (!isMockMode() && env.MUSIC_PROVIDER === "kunavo" && env.MUSIC_PROVIDER_API_KEY) {
    return new KunavoMusicProvider();
  }
  if (
    !isMockMode() &&
    env.MUSIC_PROVIDER === "http" &&
    env.MUSIC_PROVIDER_URL &&
    env.MUSIC_PROVIDER_API_KEY
  ) {
    return new HttpMusicProvider();
  }
  if (isMockMode()) return new MockMusicProvider();
  throw new Error(`Music provider is not configured: ${env.MUSIC_PROVIDER}`);
}

export function getVideoProvider(): VideoProvider {
  const env = getEnv();
  if (
    !isMockMode() &&
    env.VIDEO_PROVIDER === "http" &&
    env.VIDEO_PROVIDER_URL &&
    env.VIDEO_PROVIDER_API_KEY
  ) {
    return new HttpVideoProvider();
  }
  if (isMockMode()) return new MockVideoProvider();
  throw new Error(`Video provider is not configured: ${env.VIDEO_PROVIDER}`);
}

export function getCoverArtProvider(): CoverArtProvider {
  const env = getEnv();
  if (
    !isMockMode() &&
    env.COVER_PROVIDER === "http" &&
    env.COVER_PROVIDER_URL &&
    env.COVER_PROVIDER_API_KEY
  ) {
    return new HttpCoverArtProvider();
  }
  if (isMockMode()) return new MockCoverArtProvider();
  if (env.COVER_PROVIDER === "music" || env.COVER_PROVIDER === "builtin") {
    return new BuiltInCoverArtProvider();
  }
  throw new Error(`Cover provider is not configured: ${env.COVER_PROVIDER}`);
}

export * from "./types";

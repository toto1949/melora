import { describe, expect, it } from "vitest";
import type { AppEnv } from "@/lib/env";
import { getProductionReadiness, isReadyForProduction } from "@/lib/production-readiness";

function productionEnv(overrides: Partial<AppEnv> = {}): AppEnv {
  return {
    NEXT_PUBLIC_APP_URL: "https://memoriestomelody.com",
    NEXT_PUBLIC_BRAND_NAME: "Memories to Melody",
    USE_MOCK_PROVIDERS: false,
    VIDEO_FEATURE_ENABLED: false,
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    SUPABASE_SERVICE_ROLE_KEY: "service",
    STRIPE_SECRET_KEY: "stripe",
    STRIPE_WEBHOOK_SECRET: "webhook",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "publishable",
    RESEND_API_KEY: "resend",
    EMAIL_FROM: "Memories to Melody <hello@memoriestomelody.com>",
    OPENAI_API_KEY: "openai",
    OPENAI_BASE_URL: undefined,
    OPENAI_MODEL: "gpt-4o-mini",
    LYRICS_PROVIDER: "openai",
    MUSIC_PROVIDER: "kunavo",
    MUSIC_PROVIDER_URL: undefined,
    MUSIC_PROVIDER_API_KEY: "music",
    VIDEO_PROVIDER: "mock",
    VIDEO_PROVIDER_URL: undefined,
    VIDEO_PROVIDER_API_KEY: undefined,
    COVER_PROVIDER: "music",
    COVER_PROVIDER_URL: undefined,
    COVER_PROVIDER_API_KEY: undefined,
    JOB_WORKER_SECRET: "worker",
    CRON_SECRET: "cron",
    LISTEN_TOKEN_SECRET: "listen",
    STORAGE_BUCKET: "melora-media",
    UPSTASH_REDIS_REST_URL: "https://redis.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "redis",
    MALWARE_SCAN_REQUIRED: true,
    MALWARE_SCANNER_URL: "https://scanner.example.com",
    MALWARE_SCANNER_API_KEY: "scanner",
    TWILIO_ACCOUNT_SID: undefined,
    TWILIO_AUTH_TOKEN: undefined,
    TWILIO_FROM_NUMBER: undefined,
    ...overrides,
  };
}

describe("production readiness", () => {
  it("does not require a video provider before the flagged release", () => {
    expect(isReadyForProduction(productionEnv())).toBe(true);
  });

  it("requires a complete video provider when the flag is enabled", () => {
    const checks = getProductionReadiness(productionEnv({ VIDEO_FEATURE_ENABLED: true }));
    expect(checks.find((check) => check.name === "Video provider")).toMatchObject({
      configured: false,
      required: true,
    });
    expect(isReadyForProduction(productionEnv({ VIDEO_FEATURE_ENABLED: true }))).toBe(false);
  });

  it("fails readiness when production security services are missing", () => {
    expect(
      isReadyForProduction(
        productionEnv({
          UPSTASH_REDIS_REST_URL: undefined,
          MALWARE_SCAN_REQUIRED: false,
        }),
      ),
    ).toBe(false);
  });
});

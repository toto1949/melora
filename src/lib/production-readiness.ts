import type { AppEnv } from "@/lib/env";

export interface ReadinessCheck {
  name: string;
  configured: boolean;
  required: boolean;
  detail: string;
}

export function getProductionReadiness(env: AppEnv): ReadinessCheck[] {
  const videoRequired = env.VIDEO_FEATURE_ENABLED;
  const coverUsesHttp = env.COVER_PROVIDER === "http";
  const musicConfigured =
    (env.MUSIC_PROVIDER === "kunavo" && Boolean(env.MUSIC_PROVIDER_API_KEY)) ||
    (env.MUSIC_PROVIDER === "http" &&
      Boolean(env.MUSIC_PROVIDER_URL && env.MUSIC_PROVIDER_API_KEY));

  return [
    {
      name: "Mock providers disabled",
      configured: !env.USE_MOCK_PROVIDERS,
      required: true,
      detail: env.USE_MOCK_PROVIDERS ? "Mock mode" : "Production mode",
    },
    {
      name: "Supabase",
      configured: Boolean(
        env.NEXT_PUBLIC_SUPABASE_URL &&
          env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          env.SUPABASE_SERVICE_ROLE_KEY,
      ),
      required: true,
      detail: "Database, auth, and private storage",
    },
    {
      name: "Stripe",
      configured: Boolean(
        env.STRIPE_SECRET_KEY &&
          env.STRIPE_WEBHOOK_SECRET &&
          env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      ),
      required: true,
      detail: "Checkout and signed webhooks",
    },
    {
      name: "Resend",
      configured: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
      required: true,
      detail: "Transactional email",
    },
    {
      name: "Lyrics provider",
      configured:
        env.LYRICS_PROVIDER === "openai" && Boolean(env.OPENAI_API_KEY),
      required: true,
      detail: env.LYRICS_PROVIDER,
    },
    {
      name: "Music provider",
      configured: musicConfigured,
      required: true,
      detail: env.MUSIC_PROVIDER,
    },
    {
      name: "Cover provider",
      configured:
        env.COVER_PROVIDER === "music" ||
        env.COVER_PROVIDER === "builtin" ||
        (coverUsesHttp && Boolean(env.COVER_PROVIDER_URL && env.COVER_PROVIDER_API_KEY)),
      required: true,
      detail: env.COVER_PROVIDER,
    },
    {
      name: "Video provider",
      configured:
        videoRequired &&
        env.VIDEO_PROVIDER === "http" &&
        Boolean(env.VIDEO_PROVIDER_URL && env.VIDEO_PROVIDER_API_KEY),
      required: videoRequired,
      detail: videoRequired ? env.VIDEO_PROVIDER : "Feature disabled",
    },
    {
      name: "Job worker security",
      configured: Boolean(
        env.JOB_WORKER_SECRET && env.CRON_SECRET && env.LISTEN_TOKEN_SECRET,
      ),
      required: true,
      detail: "Separate worker and listening-token secrets",
    },
    {
      name: "Distributed rate limiting",
      configured: Boolean(
        env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN,
      ),
      required: true,
      detail: "Upstash Redis",
    },
    {
      name: "Malware scanning",
      configured: Boolean(
        env.MALWARE_SCAN_REQUIRED &&
          env.MALWARE_SCANNER_URL &&
          env.MALWARE_SCANNER_API_KEY,
      ),
      required: true,
      detail: env.MALWARE_SCAN_REQUIRED ? "Fail closed" : "Not enforced",
    },
  ];
}

export function isReadyForProduction(env: AppEnv) {
  return getProductionReadiness(env).every(
    (check) => !check.required || check.configured,
  );
}

import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_BRAND_NAME: z.string().default("Melora"),
  USE_MOCK_PROVIDERS: z
    .string()
    .optional()
    .transform((v) => v !== "false"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Melora <hello@melora.app>"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  MUSIC_PROVIDER: z.string().default("mock"),
  VIDEO_PROVIDER: z.string().default("mock"),
  LYRICS_PROVIDER: z.string().default("mock"),
  JOB_WORKER_SECRET: z.string().default("dev-worker-secret"),
  STORAGE_BUCKET: z.string().default("melora-media"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME,
    USE_MOCK_PROVIDERS: process.env.USE_MOCK_PROVIDERS,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    MUSIC_PROVIDER: process.env.MUSIC_PROVIDER,
    VIDEO_PROVIDER: process.env.VIDEO_PROVIDER,
    LYRICS_PROVIDER: process.env.LYRICS_PROVIDER,
    JOB_WORKER_SECRET: process.env.JOB_WORKER_SECRET,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Invalid environment variables");
  }

  cached = parsed.data;
  return cached;
}

export function isMockMode() {
  const env = getEnv();
  if (process.env.USE_MOCK_PROVIDERS === "false") return false;
  return (
    env.USE_MOCK_PROVIDERS ||
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.STRIPE_SECRET_KEY
  );
}

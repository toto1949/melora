import { NextResponse } from "next/server";
import { getEnv, isMockMode } from "@/lib/env";
import { getProductionReadiness } from "@/lib/production-readiness";
import { trySupabaseAdmin } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = getEnv();
  const checks = getProductionReadiness(env);
  let databaseReachable = false;
  const supabase = trySupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("site_settings").select("key").limit(1);
    databaseReachable = !error;
  }
  const ready = env.USE_MOCK_PROVIDERS
    ? process.env.NODE_ENV !== "production"
    : checks.every((check) => !check.required || check.configured) && databaseReachable;

  return NextResponse.json({
    ok: ready,
    service: "melora",
    mockMode: isMockMode(),
    databaseReachable,
    videoEnabled: env.VIDEO_FEATURE_ENABLED,
    checks: checks.map(({ name, configured, required }) => ({ name, configured, required })),
    timestamp: new Date().toISOString(),
  }, { status: ready ? 200 : 503 });
}

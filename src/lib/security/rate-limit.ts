import { getEnv } from "@/lib/env";
import { logEvent } from "@/lib/observability/logger";

type Bucket = { count: number; resetAt: number };
const localBuckets = new Map<string, Bucket>();

export async function rateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
): Promise<{ success: boolean; remaining: number }> {
  const env = getEnv();
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      return await upstashRateLimit(
        key,
        limit,
        windowMs,
        env.UPSTASH_REDIS_REST_URL,
        env.UPSTASH_REDIS_REST_TOKEN,
      );
    } catch (error) {
      logEvent("warn", "distributed_rate_limit_error", {
        error: error instanceof Error ? error.message : "Unknown Upstash error",
      });
      return localRateLimit(key, limit, windowMs);
    }
  }
  return localRateLimit(key, limit, windowMs);
}

async function upstashRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  url: string,
  token: string,
): Promise<{ success: boolean; remaining: number }> {
  const windowSec = Math.ceil(windowMs / 1000);
  const redisKey = `melora:rl:${key}`;
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, windowSec.toString(), "NX"],
    ]),
  });
  if (!res.ok) {
    logEvent("warn", "distributed_rate_limit_unavailable", { status: res.status });
    return localRateLimit(key, limit, windowMs);
  }
  const data = (await res.json()) as Array<{ result: number }>;
  const count = data[0]?.result ?? 0;
  return { success: count <= limit, remaining: Math.max(0, limit - count) };
}

function localRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  const now = Date.now();
  const bucket = localBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    localBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  bucket.count += 1;
  return { success: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count) };
}

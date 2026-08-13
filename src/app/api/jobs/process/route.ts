import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { processQueuedJobs } from "@/lib/jobs/pipeline";
import { logEvent } from "@/lib/observability/logger";
import { timingSafeEqual } from "crypto";
import { after } from "next/server";

export const maxDuration = 300;

async function authorize(req: NextRequest) {
  const env = getEnv();
  const workerSecret = req.headers.get("x-job-worker-secret");
  if (workerSecret && safeEqual(workerSecret, env.JOB_WORKER_SECRET)) return true;

  const cronSecret = env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader && safeEqual(authHeader, `Bearer ${cronSecret}`)) return true;

  return false;
}

function safeEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

async function runWorker(orderId?: string) {
  const startedAt = Date.now();
  logEvent("info", "generation_worker_started", { orderId: orderId ?? null });
  const results = await processQueuedJobs(orderId);
  const failures = results.filter((result) => "error" in result);
  logEvent(failures.length ? "warn" : "info", "generation_worker_completed", {
    orderId: orderId ?? null,
    processed: results.length,
    failures: failures.length,
    durationMs: Date.now() - startedAt,
  });
  return results;
}

function scheduleWorker(orderId?: string) {
  after(async () => {
    try {
      await runWorker(orderId);
    } catch (error) {
      logEvent("error", "generation_worker_crashed", {
        orderId: orderId ?? null,
        error: error instanceof Error ? error.message : "Unknown worker error",
      });
    }
  });
}

export async function POST(req: NextRequest) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { orderId?: string };
  scheduleWorker(body.orderId);
  return NextResponse.json({ ok: true, scheduled: true }, { status: 202 });
}

export async function GET(req: NextRequest) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  scheduleWorker();
  return NextResponse.json({ ok: true, scheduled: true }, { status: 202 });
}

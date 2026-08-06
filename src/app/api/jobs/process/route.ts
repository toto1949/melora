import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { processQueuedJobs } from "@/lib/jobs/pipeline";

async function authorize(req: NextRequest) {
  const env = getEnv();
  const workerSecret = req.headers.get("x-job-worker-secret");
  if (workerSecret && workerSecret === env.JOB_WORKER_SECRET) return true;

  const cronSecret = env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  return false;
}

export async function POST(req: NextRequest) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { orderId?: string };
  const results = await processQueuedJobs(body.orderId);
  return NextResponse.json({ ok: true, results });
}

export async function GET(req: NextRequest) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = await processQueuedJobs();
  return NextResponse.json({ ok: true, results });
}

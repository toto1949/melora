import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { processQueuedJobs } from "@/lib/jobs/pipeline";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-job-worker-secret");
  const env = getEnv();
  if (secret !== env.JOB_WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { orderId?: string };
  const results = await processQueuedJobs(body.orderId);
  return NextResponse.json({ ok: true, results });
}

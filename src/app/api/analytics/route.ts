import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/db/repository";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    eventName?: string;
    properties?: Record<string, unknown>;
    sessionId?: string;
    projectId?: string;
    orderId?: string;
  };
  if (!body.eventName) {
    return NextResponse.json({ error: "eventName required" }, { status: 400 });
  }
  await trackEvent(body.eventName, body.properties || {}, {
    sessionId: body.sessionId,
    projectId: body.projectId,
    orderId: body.orderId,
  });
  return NextResponse.json({ ok: true });
}

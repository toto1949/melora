import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/session";
import type { MarketingGenerationRequest } from "@/types/marketing";

function getN8nBaseUrl() {
  const value = process.env.MARKETING_N8N_BASE_URL?.replace(/\/$/, "");
  if (!value) throw new Error("MARKETING_N8N_BASE_URL is not configured");
  return value;
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const body = (await request.json()) as MarketingGenerationRequest;

    if (!body.angle?.trim()) {
      return NextResponse.json({ error: "Campaign angle is required." }, { status: 400 });
    }
    if (!body.campaign?.trim()) {
      return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
    }
    if (!body.strictVideoPrompt?.trim()) {
      return NextResponse.json({ error: "Strict video prompt is required." }, { status: 400 });
    }

    const response = await fetch(`${getN8nBaseUrl()}/webhook/mtm-generate-video`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        angle: body.angle,
        campaign: body.campaign,
        hook: body.hook,
        strictVideoPrompt: body.strictVideoPrompt,
        instagramCaption: body.instagramCaption,
        facebookPost: body.facebookPost,
        tiktokCaption: body.tiktokCaption,
        platforms: body.platforms,
      }),
      cache: "no-store",
    });

    const text = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Video generation failed.", details: payload },
        { status: response.status },
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "UNAUTHORIZED" || message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

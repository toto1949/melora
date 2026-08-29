import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/session";
import type {
  MarketingGenerationPayload,
  MarketingPublishPayload,
  MarketingReviewAction,
} from "@/types/marketing";

function getN8nBaseUrl() {
  const value = process.env.MARKETING_N8N_BASE_URL?.replace(/\/$/, "");
  if (!value) throw new Error("MARKETING_N8N_BASE_URL is not configured");
  return value;
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const token = process.env.MARKETING_REVIEW_TOKEN;
    if (!token) throw new Error("MARKETING_REVIEW_TOKEN is not configured");

    const body = (await request.json()) as {
      action: MarketingReviewAction;
      generationPayload?: MarketingGenerationPayload;
      publishPayload?: MarketingPublishPayload;
      strictVideoPrompt?: string;
    };

    if (!(["approve", "reject", "regenerate"] as const).includes(body.action)) {
      return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
    }

    const response = await fetch(`${getN8nBaseUrl()}/webhook/mtm-review-action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token,
        action: body.action,
        generationPayload: body.generationPayload ?? {},
        publishPayload: body.publishPayload ?? {},
        strictVideoPrompt: body.strictVideoPrompt,
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
        { error: "Review action failed.", details: payload },
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

import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, getGuestToken } from "@/lib/auth/session";
import { readServerAnalyticsContext, safeTrackEvent } from "@/lib/analytics/server";
import { safePagePath } from "@/lib/analytics/attribution";
import { getProject } from "@/lib/db/repository";
import { ownsProject } from "@/lib/security/ownership";
import { rateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  eventId: z.uuid(),
  eventName: z.enum(["page_view", "create_song_clicked", "checkout_viewed", "begin_checkout"]),
  projectId: z.uuid().optional(),
  properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
}).strict();

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  return !origin || origin === new URL(req.url).origin;
}

function safeProperties(eventName: z.infer<typeof bodySchema>["eventName"], input: Record<string, string | number | boolean>) {
  const path = safePagePath(typeof input.path === "string" ? input.path : null);
  if (eventName === "page_view") return path ? { path } : null;
  if (eventName === "create_song_clicked") return path ? { path, destination: "/studio" } : null;
  if (eventName === "checkout_viewed") return path ? { path } : { path: "/studio/checkout" };
  const value = typeof input.value_cents === "number" && Number.isInteger(input.value_cents)
    ? Math.max(0, Math.min(input.value_cents, 1_000_000))
    : 0;
  const currency = typeof input.currency === "string" ? input.currency.toLowerCase().slice(0, 3) : "usd";
  return { value_cents: value, currency };
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const properties = safeProperties(parsed.eventName, parsed.properties);
  if (!properties) return NextResponse.json({ error: "Invalid event properties" }, { status: 400 });

  const [user, guestToken] = await Promise.all([getCurrentUser(), getGuestToken()]);
  const context = await readServerAnalyticsContext(user);
  if (context.isInternal || !context.visitorId || !context.sessionId) {
    return new NextResponse(null, { status: 202 });
  }
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limiterIdentity = context.sessionId || createHash("sha256").update(forwardedFor).digest("hex").slice(0, 20);
  const allowed = await rateLimit(`analytics:${limiterIdentity}`, 90, 60_000);
  if (!allowed.success) return new NextResponse(null, { status: 202 });

  if (parsed.eventName === "checkout_viewed" || parsed.eventName === "begin_checkout") {
    if (!parsed.projectId) return NextResponse.json({ error: "Project required" }, { status: 400 });
    const project = await getProject(parsed.projectId, guestToken);
    if (!project || !ownsProject(project, user, guestToken)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  await safeTrackEvent(parsed.eventName, properties, {
    ...context,
    projectId: parsed.projectId,
    pagePath: "path" in properties ? String(properties.path) : null,
    dedupeKey: `client:${parsed.eventId}`,
  });
  return new NextResponse(null, { status: 202 });
}

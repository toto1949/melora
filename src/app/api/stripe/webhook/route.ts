import { constructWebhookEvent } from "@/lib/stripe/client";
import { processStripeEvent } from "@/lib/stripe/webhook";
import { logEvent } from "@/lib/observability/logger";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature" }, { status: 400 });
  const payload = await req.text(); // Do not JSON-parse before cryptographic verification.
  let event;
  try { event = await constructWebhookEvent(payload, signature); }
  catch { return Response.json({ error: "Invalid signature" }, { status: 400 }); }
  logEvent("info", "stripe_webhook_received", { eventId: event.id, type: event.type });
  try {
    await processStripeEvent(event);
    return Response.json({ received: true });
  } catch {
    logEvent("error", "stripe_webhook_failed", { eventId: event.id, type: event.type });
    // Database/Stripe outages must be retried. Never acknowledge a lost fulfillment.
    return Response.json({ error: "Webhook processing unavailable" }, { status: 500 });
  }
}

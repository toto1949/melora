import type Stripe from "stripe";
import { getStripe } from "./client";
import { getOrder } from "@/lib/db/repository";
import { getSupabaseAdmin } from "@/lib/db/client";
import { logEvent } from "@/lib/observability/logger";
import { SONG_CURRENCY, SONG_PRICE_CENTS } from "@/lib/pricing";

const idOf = (value: string | { id: string } | null) => typeof value === "string" ? value : value?.id ?? null;
export const handledEvents = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "payment_intent.payment_failed", "charge.refunded", "charge.dispute.created", "charge.dispute.closed"];

export async function processStripeEvent(event: Stripe.Event) {
  if (!handledEvents.includes(event.type)) return;
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe unavailable");
  let orderId: string | undefined;
  let session: Stripe.Checkout.Session | null = null;
  let intent: Stripe.PaymentIntent;
  let state = "failed";
  const object = event.data.object;
  if (object.object === "checkout.session") {
    session = await stripe.checkout.sessions.retrieve(object.id, { expand: ["line_items.data.price", "payment_intent.latest_charge"] });
    orderId = session.metadata?.order_id;
    if (!orderId) return; // Static Payment Links/other products cannot authorize this application.
    if (event.type !== "checkout.session.async_payment_failed" && session.payment_status !== "paid") return;
    if (!session.payment_intent) throw new Error("Missing payment intent");
    intent = typeof session.payment_intent === "string"
      ? await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ["latest_charge"] })
      : session.payment_intent;
    state = session.payment_status === "paid" ? "paid" : "failed";
  } else {
    let intentId: string | null = null;
    if (object.object === "payment_intent") intentId = object.id;
    if (object.object === "charge") intentId = idOf(object.payment_intent);
    if (object.object === "dispute") intentId = idOf(object.payment_intent);
    if (!intentId) throw new Error("Missing payment intent");
    intent = await stripe.paymentIntents.retrieve(intentId, { expand: ["latest_charge"] });
    orderId = intent.metadata.order_id;
    if (!orderId) return;
  }
  const order = await getOrder(orderId);
  if (!order || !order.stripeCheckoutSessionId) throw new Error("Order checkout not yet persisted");
  if (!session) session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId, { expand: ["line_items.data.price"] });
  if (session.id !== order.stripeCheckoutSessionId || idOf(session.payment_intent) !== intent.id ||
      session.metadata?.order_id !== order.id || intent.metadata.order_id !== order.id ||
      intent.currency !== order.currency || intent.amount < order.subtotalCents ||
      session.livemode !== event.livemode || intent.livemode !== event.livemode) throw new Error("Payment association mismatch");
  const line = session.line_items?.data;
  if (session.mode !== "payment" || !line || line.length !== 1 || session.line_items?.has_more ||
      line[0].price?.id !== order.stripePriceId || line[0].quantity !== 1 || line[0].price?.unit_amount !== SONG_PRICE_CENTS ||
      session.amount_subtotal !== SONG_PRICE_CENTS || session.currency !== SONG_CURRENCY || session.total_details?.amount_discount !== 0) throw new Error("Checkout price mismatch");
  if (state === "paid" && (intent.status !== "succeeded" || intent.amount_received !== session.amount_total || session.status !== "complete")) throw new Error("Payment is not settled");
  const charge = typeof intent.latest_charge === "string" ? await stripe.charges.retrieve(intent.latest_charge) : intent.latest_charge;
  // Read current Stripe state to survive delayed/out-of-order refund and dispute events.
  if (charge?.disputed || event.type.startsWith("charge.dispute.")) state = "disputed";
  else if (charge?.amount_refunded) state = charge.refunded ? "refunded" : "partially_refunded";
  if (state === "failed" && intent.status === "succeeded") return; // stale failure cannot regress a successful payment
  const { data, error } = await getSupabaseAdmin().rpc("apply_stripe_event", {
    p_event: event.id, p_type: event.type, p_order: order.id, p_state: state,
    p_session: session.id, p_intent: intent.id, p_price: line[0].price!.id,
    p_total: session.amount_total, p_tax: session.total_details?.amount_tax ?? 0,
    p_refunded: charge?.amount_refunded ?? 0, p_name: session.customer_details?.name ?? null,
  });
  if (error) throw new Error("Payment transaction failed");
  if (data) logEvent("info", state === "paid" ? "payment_confirmed" : state.includes("refunded") ? "refund_received" : "payment_state_updated", { orderId: order.id, eventId: event.id, state });
}

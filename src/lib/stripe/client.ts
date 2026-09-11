import Stripe from "stripe";
import { getEnv, isMockMode } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/db/client";
import { getOrder } from "@/lib/db/repository";
import type { Order } from "@/types";
import { logEvent } from "@/lib/observability/logger";
import { SONG_CURRENCY, SONG_PRICE_CENTS } from "@/lib/pricing";

export function getStripe() {
  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY) return null;
  if (process.env.VERCEL_ENV !== "production" && env.STRIPE_SECRET_KEY.startsWith("sk_live_")) {
    throw new Error("Live Stripe credentials are restricted to production");
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export async function createCheckoutSession(order: Order, successUrl: string, cancelUrl: string) {
  const env = getEnv();
  if (isMockMode() && process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    return { id: `cs_mock_${order.id}`, url: `${env.NEXT_PUBLIC_APP_URL}/api/stripe/mock-complete?orderId=${order.id}`, mocked: true };
  }
  const stripe = getStripe();
  if (!stripe || !env.STRIPE_PRICE_ID) throw new Error("Stripe checkout is not configured");
  if (order.paymentStatus && !["pending", "failed"].includes(order.paymentStatus)) {
    return { id: order.stripeCheckoutSessionId!, url: successUrl, mocked: false };
  }
  if (order.stripeCheckoutSessionId) {
    const previous = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
    if (previous.status === "open" && previous.url) return { id: previous.id, url: previous.url, mocked: false };
    if (previous.status === "complete") return { id: previous.id, url: successUrl, mocked: false };
    if (previous.status !== "expired") throw new Error("Checkout requires reconciliation");
    const { error } = await getSupabaseAdmin().rpc("rotate_checkout", { p_order: order.id, p_expired_session: previous.id });
    if (error) throw new Error("Checkout retry unavailable");
    order = (await getOrder(order.id))!;
  }
  const price = await stripe.prices.retrieve(env.STRIPE_PRICE_ID);
  if (!price.active || price.type !== "one_time" || price.currency !== SONG_CURRENCY || price.unit_amount !== SONG_PRICE_CENTS || price.tax_behavior !== "exclusive") {
    throw new Error("Configured Stripe price must be active USD 19.99, one-time, tax exclusive");
  }
  if (order.subtotalCents !== SONG_PRICE_CENTS || order.discountCents !== 0 || order.currency !== SONG_CURRENCY) throw new Error("Order price mismatch");
  const expiresAt = Math.floor(new Date(order.checkoutExpiresAt!).getTime() / 1000);
  // Parameters remain identical across retries. Never resubmit an uncertain old request after Stripe's retention window.
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() / 1000) throw new Error("Checkout creation requires support reconciliation");
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: order.email,
    billing_address_collection: "required",
    name_collection: { individual: { enabled: true } },
    automatic_tax: { enabled: true },
    client_reference_id: order.id,
    metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id } },
    line_items: [{ price: price.id, quantity: 1 }],
    expires_at: expiresAt,
  }, { idempotencyKey: `checkout:${order.id}:${order.checkoutAttempt}` });
  const { error } = await getSupabaseAdmin().rpc("bind_checkout", {
    p_order: order.id, p_attempt: order.checkoutAttempt, p_session: session.id, p_price: price.id,
  });
  if (error) throw new Error("Checkout persistence failed");
  if (!session.url) throw new Error("Checkout URL unavailable");
  logEvent("info", "checkout_created", { orderId: order.id, sessionId: session.id });
  return { id: session.id, url: session.url, mocked: false };
}

export async function constructWebhookEvent(payload: string, signature: string) {
  const stripe = getStripe();
  if (!stripe || !getEnv().STRIPE_WEBHOOK_SECRET) throw new Error("Stripe webhook not configured");
  return stripe.webhooks.constructEvent(payload, signature, getEnv().STRIPE_WEBHOOK_SECRET!);
}

import Stripe from "stripe";
import { getEnv, isMockMode } from "@/lib/env";
import type { Order } from "@/types";

export function getStripe() {
  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY) return null;
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export async function createCheckoutSession(order: Order, successUrl: string, cancelUrl: string) {
  const env = getEnv();

  if (isMockMode() || !env.STRIPE_SECRET_KEY) {
    const mockUrl = `${env.NEXT_PUBLIC_APP_URL}/api/stripe/mock-complete?orderId=${order.id}`;
    return {
      id: `cs_mock_${order.id}`,
      url: mockUrl,
      mocked: true as const,
    };
  }

  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: order.email,
    client_reference_id: order.id,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
    payment_intent_data: {
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: order.currency,
          unit_amount: order.totalCents,
          product_data: {
            name: `Melora — ${order.package?.name || "Personalized Song"}`,
            description: `Order ${order.orderNumber}`,
          },
        },
      },
    ],
    allow_promotion_codes: true,
  });

  return { id: session.id, url: session.url!, mocked: false as const };
}

export async function constructWebhookEvent(payload: string, signature: string) {
  const env = getEnv();
  const stripe = getStripe();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe webhook not configured");
  }
  return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}

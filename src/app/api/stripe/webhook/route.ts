import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe/client";
import { getOrder, trackEvent, updateOrderStatus } from "@/lib/db/repository";
import { startGenerationPipeline } from "@/lib/jobs/pipeline";
import { sendEmail } from "@/lib/email/send";
import { isMockMode } from "@/lib/env";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({
      ok: true,
      message: "Mock mode: use /api/stripe/mock-complete instead",
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const payload = await req.text();

  try {
    const event = await constructWebhookEvent(payload, signature);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        metadata?: { orderId?: string };
        payment_intent?: string;
      };
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await getOrder(orderId);
        if (order && order.status === "awaiting_payment") {
          await updateOrderStatus(orderId, "payment_confirmed", {
            stripeCheckoutSessionId: undefined,
          });
          await sendEmail({
            to: order.email,
            template: "order-confirmation",
            data: {
              orderNumber: order.orderNumber,
              estimatedDelivery: order.estimatedDeliveryAt || "soon",
            },
          });
          await trackEvent("purchase_completed", {}, { orderId });
          // Respond to Stripe immediately; run the (slow) generation
          // pipeline after the response is sent.
          after(async () => {
            try {
              await startGenerationPipeline(orderId);
            } catch (error) {
              console.error("pipeline error", orderId, error);
            }
          });
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as { metadata?: { orderId?: string } };
      const orderId = intent.metadata?.orderId;
      if (orderId) {
        const order = await getOrder(orderId);
        if (order) {
          await updateOrderStatus(orderId, "failed", { failedReason: "payment_failed" });
          await sendEmail({
            to: order.email,
            template: "payment-failed",
            data: {
              orderNumber: order.orderNumber,
              retryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/studio/${order.projectId}/checkout`,
            },
          });
        }
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as { metadata?: { orderId?: string } };
      const orderId = charge.metadata?.orderId;
      if (orderId) {
        const order = await getOrder(orderId);
        if (order && order.status !== "refunded") {
          await updateOrderStatus(orderId, "refunded", { failedReason: "refunded" });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

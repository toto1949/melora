import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe/client";
import { getOrder, trackEvent, updateOrderStatus } from "@/lib/db/repository";
import { startGenerationPipeline } from "@/lib/jobs/pipeline";
import { sendEmail } from "@/lib/email/send";
import { isMockMode } from "@/lib/env";
import { logEvent } from "@/lib/observability/logger";

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
        if (order && ["awaiting_payment", "payment_confirmed"].includes(order.status)) {
          const firstConfirmation = order.status === "awaiting_payment";
          if (firstConfirmation) {
            await updateOrderStatus(orderId, "payment_confirmed", {
              stripeCheckoutSessionId: undefined,
            });
          }

          // Enqueue every stage idempotently before responding. The production
          // pipeline schedules a separate worker invocation and returns quickly.
          await startGenerationPipeline(orderId);

          after(async () => {
            if (firstConfirmation) {
              try {
                await trackEvent("purchase_completed", {}, { orderId });
              } catch (error) {
                logEvent("error", "purchase_tracking_failed", {
                  orderId,
                  error: error instanceof Error ? error.message : "Unknown tracking error",
                });
              }
              try {
                await sendEmail({
                  to: order.email,
                  template: "order-confirmation",
                  data: {
                    orderNumber: order.orderNumber,
                    estimatedDelivery: order.estimatedDeliveryAt || "soon",
                  },
                });
              } catch (error) {
                logEvent("error", "order_confirmation_email_failed", {
                  orderId,
                  error: error instanceof Error ? error.message : "Unknown email error",
                });
              }
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
    logEvent("error", "stripe_webhook_failed", {
      error: error instanceof Error ? error.message : "Unknown webhook error",
    });
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

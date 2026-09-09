import Link from "next/link";
import { PurchaseTracker } from "@/components/analytics/purchase-tracker";
import { getOrder } from "@/lib/db/repository";
import { getMessages } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { getLocale } from "@/lib/i18n";

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { projectId } = await params;
  const { orderId } = await searchParams;
  const [order, messages, locale] = await Promise.all([orderId ? getOrder(orderId) : null, getMessages(), getLocale()]);
  const copy = messages.studio.success;
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      {order ? (
        <PurchaseTracker
          transactionId={order.orderNumber}
          value={order.totalCents / 100}
          currency={(order.currency || "USD").toUpperCase()}
        />
      ) : null}
      <div className="surface-card max-w-lg p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-2xl text-gold" aria-hidden="true">✓</div>
        <p className="font-display text-4xl text-navy">Payment confirmed</p>
        <p className="mt-3 prose-muted">
          {order
            ? `Order ${order.orderNumber} is confirmed. We’ve started creating your personalized song now.`
            : "Your payment is confirmed. We’ve started creating your personalized song now."}
        </p>
        {order ? (
          <dl className="mt-6 space-y-3 rounded-2xl bg-cream p-4 text-left text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted">Order</dt><dd className="font-semibold">{order.orderNumber}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Receipt sent to</dt><dd className="break-all text-right font-semibold">{order.email}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Total</dt><dd className="font-semibold">{formatCurrency(order.totalCents, order.currency, locale)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Status</dt><dd className="text-right font-semibold">Creating your song</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Typical wait</dt><dd className="text-right font-semibold">Usually a few minutes</dd></div>
          </dl>
        ) : null}
        <p className="mt-5 text-sm text-muted">
          Your listening page updates automatically as soon as the song is ready. We’ll also email you the moment it’s finished.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {order ? (
            <Link href={`/listen/${order.shareToken}`} className="btn-primary">
              Watch song progress
            </Link>
          ) : null}
          <Link href="/dashboard/orders" className="btn-secondary">
            {copy.dashboard}
          </Link>
          <Link href={`/studio/${projectId}/review`} className="btn-secondary">
            {copy.project}
          </Link>
        </div>
      </div>
    </div>
  );
}

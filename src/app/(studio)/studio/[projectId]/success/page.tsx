import Link from "next/link";
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
      <div className="surface-card max-w-lg p-8 text-center">
        <p className="font-display text-4xl text-navy">{copy.title}</p>
        <p className="mt-3 prose-muted">
          {order
            ? copy.confirmed.replace("{order}", order.orderNumber)
            : copy.payment}
        </p>
        {order ? (
          <dl className="mt-6 space-y-3 rounded-2xl bg-cream p-4 text-left text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted">Order</dt><dd className="font-semibold">{order.orderNumber}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Receipt sent to</dt><dd className="break-all text-right font-semibold">{order.email}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Total</dt><dd className="font-semibold">{formatCurrency(order.totalCents, order.currency, locale)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Estimated delivery</dt><dd className="text-right font-semibold">{order.estimatedDeliveryAt ? new Date(order.estimatedDeliveryAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }) : "We’ll email you when it’s ready"}</dd></div>
          </dl>
        ) : null}
        <p className="mt-5 text-sm text-muted">You can close this page safely. We’ll keep your progress updated and email you as soon as the song is ready.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {order ? (
            <Link href={`/listen/${order.shareToken}`} className="btn-primary">
              {copy.listen}
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

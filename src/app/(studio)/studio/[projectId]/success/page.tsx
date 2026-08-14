import Link from "next/link";
import { getOrder } from "@/lib/db/repository";
import { getMessages } from "@/lib/i18n";

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { projectId } = await params;
  const { orderId } = await searchParams;
  const [order, messages] = await Promise.all([orderId ? getOrder(orderId) : null, getMessages()]);
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

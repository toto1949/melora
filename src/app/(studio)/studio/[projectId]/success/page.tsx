import Link from "next/link";
import { getOrder } from "@/lib/db/repository";

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { projectId } = await params;
  const { orderId } = await searchParams;
  const order = orderId ? await getOrder(orderId) : null;
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-lg p-8 text-center">
        <p className="font-display text-4xl text-navy">Thank you</p>
        <p className="mt-3 prose-muted">
          {order
            ? `Order ${order.orderNumber} is confirmed. We\'re creating your song now.`
            : "Your payment is confirmed. We\'re creating your song now."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {order ? (
            <Link href={`/listen/${order.shareToken}`} className="btn-primary">
              Open listening page
            </Link>
          ) : null}
          <Link href="/dashboard/orders" className="btn-secondary">
            Go to dashboard
          </Link>
          <Link href={`/studio/${projectId}/review`} className="btn-secondary">
            Back to project
          </Link>
        </div>
      </div>
    </div>
  );
}

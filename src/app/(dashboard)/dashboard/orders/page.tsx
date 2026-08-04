import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserOrders } from "@/lib/db/repository";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const orders = await listUserOrders(user.id);
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Active Orders</h1>
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-sm text-muted">{ORDER_STATUS_LABELS[order.status]} · {order.progress ?? 0}%</p>
                <p className="text-sm text-muted">Est. delivery {order.estimatedDeliveryAt ? new Date(order.estimatedDeliveryAt).toLocaleString() : "—"}</p>
                <p className="mt-2 text-sm">{formatCurrency(order.totalCents, order.currency)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/listen/${order.shareToken}`} className="btn-secondary !py-2 text-sm">Listen</Link>
                <Link href={`/dashboard/orders/${order.id}`} className="btn-primary !py-2 text-sm">Manage</Link>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-cream-deep">
              <div className="h-full rounded-full bg-gradient-to-r from-rose to-gold" style={{ width: `${order.progress ?? 0}%` }} />
            </div>
          </article>
        ))}
        {orders.length === 0 ? <p className="text-muted">No active orders.</p> : null}
      </div>
    </div>
  );
}

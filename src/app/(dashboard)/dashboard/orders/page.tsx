import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserOrders } from "@/lib/db/repository";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getLocale, getMessages } from "@/lib/i18n";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [orders, messages, locale] = await Promise.all([listUserOrders(user.id), getMessages(), getLocale()]);
  const copy = messages.dashboard.orders;
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-sm text-muted">{messages.listen.statuses[order.status]} · {order.progress ?? 0}%</p>
                <p className="text-sm text-muted">{copy.estimated} {order.estimatedDeliveryAt ? formatDate(order.estimatedDeliveryAt, locale) : "—"}</p>
                <p className="mt-2 text-sm">{formatCurrency(order.totalCents, order.currency, locale)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/listen/${order.shareToken}`} className="btn-secondary !py-2 text-sm">{copy.listen}</Link>
                <Link href={`/dashboard/orders/${order.id}`} className="btn-primary !py-2 text-sm">{copy.manage}</Link>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-cream-deep">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-fill to-gold-fill" style={{ width: `${order.progress ?? 0}%` }} />
            </div>
          </article>
        ))}
        {orders.length === 0 ? <p className="text-muted">{copy.empty}</p> : null}
      </div>
    </div>
  );
}

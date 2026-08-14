import { getCurrentUser } from "@/lib/auth/session";
import { listUserOrders } from "@/lib/db/repository";
import { formatCurrency } from "@/lib/utils";
import { getLocale, getMessages } from "@/lib/i18n";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [orders, messages, locale] = await Promise.all([listUserOrders(user.id), getMessages(), getLocale()]);
  const copy = messages.dashboard.billing;
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <p className="mt-2 text-muted">{copy.body}</p>
      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="surface-card flex justify-between gap-4 p-4 text-sm">
            <span>{order.orderNumber}</span>
            <span>{formatCurrency(order.totalCents, order.currency, locale)}</span>
            <span>{messages.listen.statuses[order.status]}</span>
          </div>
        ))}
        {orders.length === 0 ? <p className="text-muted">{copy.empty}</p> : null}
      </div>
    </div>
  );
}

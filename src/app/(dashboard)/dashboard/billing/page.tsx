import { getCurrentUser } from "@/lib/auth/session";
import { listUserOrders } from "@/lib/db/repository";
import { formatCurrency } from "@/lib/utils";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const orders = await listUserOrders(user.id);
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Billing</h1>
      <p className="mt-2 text-muted">One-time payments, optional credit packs, and creator subscriptions appear here.</p>
      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="surface-card flex justify-between gap-4 p-4 text-sm">
            <span>{order.orderNumber}</span>
            <span>{formatCurrency(order.totalCents, order.currency)}</span>
            <span>{order.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

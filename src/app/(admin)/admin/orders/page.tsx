import Link from "next/link";
import { listAllOrders } from "@/lib/db/repository";
import { formatCurrency } from "@/lib/utils";
import { exportOrdersCsvAction } from "@/lib/actions/admin";

export default async function AdminOrdersPage() {
  const orders = await listAllOrders();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Orders</h1>
        <form action={exportOrdersCsvAction}>
          <button type="submit" className="btn-secondary">Export CSV</button>
        </form>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border/70">
                <td className="p-3">{order.orderNumber}</td>
                <td className="p-3">{order.email}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">{formatCurrency(order.totalCents, order.currency)}</td>
                <td className="p-3"><Link href={`/listen/${order.shareToken}`} className="underline">Listen</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

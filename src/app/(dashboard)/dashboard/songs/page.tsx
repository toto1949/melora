import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserOrders } from "@/lib/db/repository";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export default async function SongsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const orders = (await listUserOrders(user.id)).filter((o) => ["ready", "completed"].includes(o.status) || o.currentVersion);
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">My Songs</h1>
      <div className="mt-6 grid gap-4">
        {orders.length === 0 ? <p className="text-muted">No songs yet.</p> : null}
        {orders.map((order) => (
          <article key={order.id} className="surface-card p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-cover" style={{ backgroundImage: `url(${order.currentVersion?.coverUrl || "/samples/covers/generated.svg"})` }} />
              <div className="flex-1">
                <h2 className="font-display text-2xl">{order.currentVersion?.title || "Untitled song"}</h2>
                <p className="text-sm text-muted">{order.project?.recipient?.name} · {order.project?.occasion} · {ORDER_STATUS_LABELS[order.status]}</p>
              </div>
              <Link href={`/listen/${order.shareToken}`} className="btn-primary !py-2">Play</Link>
              <Link href={`/dashboard/orders/${order.id}`} className="btn-secondary !py-2">Details</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

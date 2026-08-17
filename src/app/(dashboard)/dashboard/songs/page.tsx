import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserOrders } from "@/lib/db/repository";
import { getMessages } from "@/lib/i18n";
import { createGeneratedCoverUrl } from "@/lib/cover-art";

export default async function SongsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [allOrders, messages] = await Promise.all([listUserOrders(user.id), getMessages()]);
  const orders = allOrders.filter((o) => ["ready", "completed"].includes(o.status) || o.currentVersion);
  const copy = messages.dashboard.songs;
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <div className="mt-6 grid gap-4">
        {orders.length === 0 ? <p className="text-muted">{copy.empty}</p> : null}
        {orders.map((order) => (
          <article key={order.id} className="surface-card p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div
                className="h-20 w-20 rounded-2xl bg-cover"
                style={{
                  backgroundImage: `url(${order.currentVersion?.coverUrl || createGeneratedCoverUrl({
                    title: order.currentVersion?.title || copy.untitled,
                    genre: order.currentVersion?.genre || order.project?.preferences?.genre,
                    mood: order.currentVersion?.mood || order.project?.preferences?.mood,
                    occasion: order.project?.occasion,
                  })})`,
                }}
              />
              <div className="flex-1">
                <h2 className="font-display text-2xl">{order.currentVersion?.title || copy.untitled}</h2>
                <p className="text-sm text-muted">{order.project?.recipient?.name} · {order.project?.occasion} · {messages.listen.statuses[order.status]}</p>
              </div>
              <Link href={`/listen/${order.shareToken}`} className="btn-primary !py-2">{copy.play}</Link>
              <Link href={`/dashboard/orders/${order.id}`} className="btn-secondary !py-2">{copy.details}</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

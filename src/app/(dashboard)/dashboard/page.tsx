import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserOrders, listUserProjects, listNotifications } from "@/lib/db/repository";
import { getMessages } from "@/lib/i18n";

export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [orders, projects, notifications, messages] = await Promise.all([
    listUserOrders(user.id),
    listUserProjects(user.id),
    listNotifications(user.id),
    getMessages(),
  ]);
  const copy = messages.dashboard.home;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-navy">{copy.welcome.replace("{name}", user.fullName ? `, ${user.fullName}` : "")}</h1>
        <p className="mt-2 text-muted">{copy.body}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5"><p className="text-sm text-muted">{copy.songsOrders}</p><p className="font-display text-3xl">{orders.length}</p></div>
        <div className="surface-card p-5"><p className="text-sm text-muted">{copy.drafts}</p><p className="font-display text-3xl">{projects.filter(p => p.status === "draft").length}</p></div>
        <div className="surface-card p-5"><p className="text-sm text-muted">{copy.notifications}</p><p className="font-display text-3xl">{notifications.filter(n => !n.readAt).length}</p></div>
      </div>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">{copy.recent}</h2>
          <Link href="/studio" className="btn-primary !py-2 text-sm">{copy.create}</Link>
        </div>
        {orders.length === 0 ? (
          <div className="surface-card p-6 text-muted">{copy.empty}</div>
        ) : (
          orders.slice(0, 5).map((order) => (
            <article key={order.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <div className="h-16 w-16 rounded-2xl bg-cover" style={{ backgroundImage: `url(${order.currentVersion?.coverUrl || "/samples/covers/generated.svg"})` }} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{order.currentVersion?.title || order.orderNumber}</p>
                <p className="text-sm text-muted">{order.project?.recipient?.name || copy.recipient} · {messages.listen.statuses[order.status]}</p>
              </div>
              <Link href={`/listen/${order.shareToken}`} className="btn-secondary !py-2 text-sm">{copy.open}</Link>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

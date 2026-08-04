import { getCurrentUser } from "@/lib/auth/session";
import { listNotifications } from "@/lib/db/repository";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const notifications = await listNotifications(user.id);
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Notifications</h1>
      <div className="mt-6 space-y-3">
        {notifications.map((n) => (
          <article key={n.id} className="surface-card p-4">
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-muted">{n.body}</p>
          </article>
        ))}
        {notifications.length === 0 ? <p className="text-muted">You are all caught up.</p> : null}
      </div>
    </div>
  );
}

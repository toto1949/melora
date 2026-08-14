import { getCurrentUser } from "@/lib/auth/session";
import { listNotifications } from "@/lib/db/repository";
import { getMessages } from "@/lib/i18n";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [notifications, messages] = await Promise.all([listNotifications(user.id), getMessages()]);
  const copy = messages.dashboard.notifications;
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <div className="mt-6 space-y-3">
        {notifications.map((n) => (
          <article key={n.id} className="surface-card p-4">
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-muted">{n.body}</p>
          </article>
        ))}
        {notifications.length === 0 ? <p className="text-muted">{copy.empty}</p> : null}
      </div>
    </div>
  );
}

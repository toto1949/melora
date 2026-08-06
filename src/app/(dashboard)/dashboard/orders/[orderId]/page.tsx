import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrder, listOrderJobs, listSongVersions } from "@/lib/db/repository";
import { updatePrivacyAction } from "@/lib/actions/listen";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  const order = await getOrder(orderId);
  if (!order || !user || (order.userId && order.userId !== user.id && user.role === "customer")) notFound();
  const [jobs, versions] = await Promise.all([listOrderJobs(orderId), listSongVersions(orderId)]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-navy">{order.orderNumber}</h1>
        <p className="text-muted">{ORDER_STATUS_LABELS[order.status]} · Revisions left: {order.revisionCreditsRemaining}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/listen/${order.shareToken}`} className="btn-primary">Open listening page</Link>
        <Link href={`/dashboard/orders/${order.id}/revisions`} className="btn-secondary">Request revision</Link>
      </div>
      <form action={updatePrivacyAction.bind(null, order.id)} className="surface-card space-y-3 p-5">
        <h2 className="font-display text-2xl">Privacy & gift reveal</h2>
        <select name="privacyMode" defaultValue={order.privacyMode} className="w-full rounded-2xl border border-border px-4 py-3">
          <option value="private">Private</option>
          <option value="password">Password protected</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="giftRevealEnabled" defaultChecked={order.giftRevealEnabled} />
          Enable gift reveal mode
        </label>
        <div>
          <label htmlFor="sharePassword" className="mb-1.5 block text-sm font-medium">
            Share password (required for password-protected links)
          </label>
          <input
            id="sharePassword"
            name="sharePassword"
            type="password"
            minLength={4}
            placeholder="Set or update share password"
            className="w-full rounded-2xl border border-border px-4 py-3"
          />
        </div>
        <button type="submit" className="btn-primary">Save privacy settings</button>
      </form>
      <section className="surface-card p-5">
        <h2 className="font-display text-2xl">Generation jobs</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {jobs.map((job) => (
            <li key={job.id} className="flex justify-between gap-3 border-b border-border py-2">
              <span>{job.jobType}</span>
              <span>{job.status} · {job.progress}%</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="surface-card p-5">
        <h2 className="font-display text-2xl">Versions</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {versions.map((v) => (
            <li key={v.id} className="flex justify-between gap-3 border-b border-border py-2">
              <span>v{v.versionNumber} · {v.title}{v.isCurrent ? " (current)" : ""}</span>
              <span>{new Date(v.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

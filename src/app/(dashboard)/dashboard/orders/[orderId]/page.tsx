import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrder, getOrderReview, listOrderJobs, listSongVersions } from "@/lib/db/repository";
import { updatePrivacyAction } from "@/lib/actions/listen";
import { submitReviewAction } from "@/lib/actions/reviews";
import { ReviewForm } from "@/components/dashboard/review-form";
import { FormError } from "@/components/studio/form-error";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ reviewed?: string; reviewError?: string }>;
}) {
  const { orderId } = await params;
  const { reviewed, reviewError } = await searchParams;
  const user = await getCurrentUser();
  const order = await getOrder(orderId);
  if (!order || !user || (order.userId && order.userId !== user.id && user.role === "customer")) notFound();
  const [jobs, versions, review] = await Promise.all([
    listOrderJobs(orderId),
    listSongVersions(orderId),
    getOrderReview(orderId),
  ]);
  const canReview = !review && ["ready", "completed"].includes(order.status);
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
        <h2 className="font-display text-2xl">Your review</h2>
        {reviewed ? (
          <p className="mt-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy">
            Thank you! Your review is now live on our reviews page.
          </p>
        ) : null}
        <FormError message={reviewError} />
        {review ? (
          <div className="mt-3 space-y-2">
            <div className="flex text-gold" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-sm prose-muted">{review.body}</p>
            <p className="text-xs text-muted">
              Shared as {review.customerName} · {new Date(review.reviewedAt).toLocaleDateString()}
            </p>
          </div>
        ) : canReview ? (
          <div className="mt-3">
            <p className="mb-4 text-sm text-muted">
              How was your experience? Your review helps other gift-givers and appears on our reviews page.
            </p>
            <ReviewForm action={submitReviewAction.bind(null, order.id)} defaultName={user.fullName ?? undefined} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            You can leave a review once your song is ready.
          </p>
        )}
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

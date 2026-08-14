import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrder, getOrderReview, listOrderJobs, listSongVersions } from "@/lib/db/repository";
import { updatePrivacyAction } from "@/lib/actions/listen";
import { submitReviewAction } from "@/lib/actions/reviews";
import { ReviewForm } from "@/components/dashboard/review-form";
import { FormError } from "@/components/studio/form-error";
import { getLocale, getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

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
  const [jobs, versions, review, messages, locale] = await Promise.all([
    listOrderJobs(orderId),
    listSongVersions(orderId),
    getOrderReview(orderId),
    getMessages(),
    getLocale(),
  ]);
  const copy = messages.dashboard.order;
  const canReview = !review && ["ready", "completed"].includes(order.status);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-navy">{order.orderNumber}</h1>
        <p className="text-muted">{messages.listen.statuses[order.status]} · {copy.revisionsLeft}: {order.revisionCreditsRemaining}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/listen/${order.shareToken}`} className="btn-primary">{copy.listen}</Link>
        <Link href={`/dashboard/orders/${order.id}/revisions`} className="btn-secondary">{copy.revision}</Link>
      </div>
      <form action={updatePrivacyAction.bind(null, order.id)} className="surface-card space-y-3 p-5">
        <h2 className="font-display text-2xl">{copy.privacyTitle}</h2>
        <select name="privacyMode" defaultValue={order.privacyMode} className="w-full rounded-2xl border border-border px-4 py-3">
          <option value="private">{copy.private}</option>
          <option value="password">{copy.password}</option>
          <option value="unlisted">{copy.unlisted}</option>
          <option value="public">{copy.public}</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="giftRevealEnabled" defaultChecked={order.giftRevealEnabled} />
          {copy.gift}
        </label>
        <div>
          <label htmlFor="sharePassword" className="mb-1.5 block text-sm font-medium">
            {copy.sharePassword}
          </label>
          <input
            id="sharePassword"
            name="sharePassword"
            type="password"
            minLength={4}
            placeholder={copy.passwordHint}
            className="w-full rounded-2xl border border-border px-4 py-3"
          />
        </div>
        <SubmitButton label={copy.save} pendingLabel={copy.saving} />
      </form>
      <section className="surface-card p-5">
        <h2 className="font-display text-2xl">{copy.jobs}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {jobs.map((job) => (
            <li key={job.id} className="flex justify-between gap-3 border-b border-border py-2">
              <span>{messages.dashboard.jobTypes[job.jobType]}</span>
              <span>{messages.dashboard.jobStatuses[job.status]} · {job.progress}%</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="surface-card p-5">
        <h2 className="font-display text-2xl">{copy.reviewTitle}</h2>
        {reviewed ? (
          <p className="mt-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy">
            {copy.reviewThanks}
          </p>
        ) : null}
        <FormError message={reviewError} />
        {review ? (
          <div className="mt-3 space-y-2">
            <div className="flex text-gold" aria-label={`${copy.rating}: ${review.rating}/5`}>
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-sm prose-muted">{review.body}</p>
            <p className="text-xs text-muted">
              {copy.sharedAs} {review.customerName} · {new Date(review.reviewedAt).toLocaleDateString(locale)}
            </p>
          </div>
        ) : canReview ? (
          <div className="mt-3">
            <p className="mb-4 text-sm text-muted">
              {copy.reviewPrompt}
            </p>
            <ReviewForm action={submitReviewAction.bind(null, order.id)} defaultName={user.fullName ?? undefined} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            {copy.reviewWait}
          </p>
        )}
      </section>
      <section className="surface-card p-5">
        <h2 className="font-display text-2xl">{copy.versions}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {versions.map((v) => (
            <li key={v.id} className="flex justify-between gap-3 border-b border-border py-2">
              <span>v{v.versionNumber} · {v.title}{v.isCurrent ? ` (${copy.current})` : ""}</span>
              <span>{new Date(v.createdAt).toLocaleString(locale)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

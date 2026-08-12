import { Star } from "lucide-react";
import { deleteReviewAction, setReviewPublishedAction } from "@/lib/actions/admin";
import { listAllReviews } from "@/lib/db/repository";
import { formatDate } from "@/lib/utils";

export default async function AdminReviewsPage() {
  const reviews = await listAllReviews();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Reviews</h1>
      <p className="text-muted">
        Customer reviews from delivered orders. Unpublished reviews are hidden from the marketing site.
      </p>
      {reviews.length === 0 ? (
        <div className="surface-card p-6 text-sm text-muted">
          No reviews yet. Customers can leave one from their order page once a song is delivered.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{review.customerName}</p>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-gold text-gold" : "text-border"}`}
                        />
                      ))}
                    </span>
                    {review.occasion ? (
                      <span className="rounded-full bg-navy/5 px-2 py-0.5 text-xs">{review.occasion}</span>
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        review.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {review.isPublished ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-muted">{review.body}</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(review.reviewedAt)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={setReviewPublishedAction.bind(null, review.id, !review.isPublished)}>
                    <button type="submit" className="btn-secondary px-4 py-2 text-sm">
                      {review.isPublished ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={deleteReviewAction.bind(null, review.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { FormError } from "@/components/studio/form-error";
import { SubmitButton } from "@/components/studio/submit-button";
import { submitBetaFeedbackAction } from "@/lib/actions/feedback";
import { getMessages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Beta Feedback",
  description: "Test Memories to Melody and send product feedback directly to the team.",
  alternates: { canonical: "/feedback" },
};

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const [{ sent, error }, messages] = await Promise.all([searchParams, getMessages()]);
  const copy = messages.feedback;
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";

  return (
    <section className="section-pad">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">{copy.eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl text-navy md:text-5xl">{copy.title}</h1>
          <p className="mt-4 prose-muted">{copy.body}</p>
          <ul className="mt-6 space-y-3 text-sm text-navy/80">
            {copy.prompts.map((prompt) => (
              <li key={prompt} className="flex gap-3">
                <span className="text-gold">✓</span>
                <span>{prompt}</span>
              </li>
            ))}
          </ul>
        </div>

        <form action={submitBetaFeedbackAction} className="surface-card space-y-5 p-6 md:p-8">
          {sent ? (
            <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {copy.sent}
            </p>
          ) : null}
          <FormError message={error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="feedback-name" className="mb-1.5 block text-sm font-medium">{copy.name}</label>
              <input id="feedback-name" name="name" required maxLength={80} autoComplete="name" className={field} />
            </div>
            <div>
              <label htmlFor="feedback-email" className="mb-1.5 block text-sm font-medium">{copy.email}</label>
              <input id="feedback-email" name="email" type="email" required maxLength={254} autoComplete="email" className={field} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="feedback-rating" className="mb-1.5 block text-sm font-medium">{copy.rating}</label>
              <select id="feedback-rating" name="rating" required defaultValue="" className={field}>
                <option value="" disabled>{copy.chooseRating}</option>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}/5</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="feedback-topic" className="mb-1.5 block text-sm font-medium">{copy.topic}</label>
              <select id="feedback-topic" name="topic" required defaultValue="" className={field}>
                <option value="" disabled>{copy.chooseTopic}</option>
                {Object.entries(copy.topics).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="feedback-body" className="mb-1.5 block text-sm font-medium">{copy.message}</label>
            <textarea id="feedback-body" name="body" required minLength={10} maxLength={3000} className={`${field} min-h-40`} placeholder={copy.messageHint} />
          </div>
          <div className="hidden" aria-hidden="true">
            <label htmlFor="feedback-website">Website</label>
            <input id="feedback-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <SubmitButton label={copy.send} pendingLabel={copy.sending} />
          <p className="text-xs text-muted">{copy.privacy}</p>
        </form>
      </div>
    </section>
  );
}

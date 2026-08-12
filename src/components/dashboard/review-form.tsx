"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useFormStatus } from "react-dom";

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Loved it"];

function SubmitButton({ ready }: { ready: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending || !ready}
    >
      {pending ? "Submitting…" : ready ? "Submit review" : "Choose a rating first"}
    </button>
  );
}

export function ReviewForm({
  action,
  defaultName,
}: {
  action: (formData: FormData) => void;
  defaultName?: string;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const active = hovered || rating;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="rating" value={rating} />
      <div>
        <p className="mb-1.5 text-sm font-medium">Your rating</p>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="rounded-lg p-1 transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  n <= active ? "fill-gold text-gold" : "text-border"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted">{LABELS[active] || "Tap to rate"}</span>
        </div>
      </div>
      <div>
        <label htmlFor="review-name" className="mb-1.5 block text-sm font-medium">
          Display name
        </label>
        <input
          id="review-name"
          name="customerName"
          defaultValue={defaultName}
          maxLength={80}
          placeholder="How your name appears with the review"
          className="w-full rounded-2xl border border-border px-4 py-3"
        />
      </div>
      <div>
        <label htmlFor="review-body" className="mb-1.5 block text-sm font-medium">
          Your experience
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          minLength={10}
          maxLength={1200}
          rows={4}
          placeholder="How did the song land? What was the reaction?"
          className="w-full rounded-2xl border border-border px-4 py-3"
        />
      </div>
      <SubmitButton ready={rating > 0} />
    </form>
  );
}

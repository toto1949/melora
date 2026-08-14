import { trackOrderAction } from "@/lib/actions/orders";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export const metadata = {
  title: "Track Your Order",
  description: "Check the status of your personalized song order with your order number and email.",
  alternates: { canonical: "/track-order" },
};

export default async function TrackOrderPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const copy = (await getMessages()).trackOrder;
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
        <p className="mt-3 prose-muted">
          {copy.body}
        </p>
        {error ? (
          <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error === "not_found" ? copy.notFound : copy.invalid}
          </p>
        ) : null}
        <form action={trackOrderAction} className="surface-card mt-8 space-y-4 p-6">
          <div>
            <label htmlFor="orderNumber" className="mb-1.5 block text-sm font-medium">
              {copy.orderNumber}
            </label>
            <input
              id="orderNumber"
              name="orderNumber"
              required
              placeholder="MLR-20260804-XXXXX"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              {copy.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3"
            />
          </div>
          <SubmitButton label={copy.submit} pendingLabel={copy.submitting} className="btn-primary w-full" />
        </form>
      </div>
    </section>
  );
}

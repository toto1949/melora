import { trackOrderAction } from "@/lib/actions/orders";
import { getMessages } from "@/lib/i18n";

export const metadata = {
  title: "Track Your Order",
  description: "Check the status of your personalized song order with your order number and email.",
  alternates: { canonical: "/track-order" },
};

export default async function TrackOrderPage() {
  const copy = (await getMessages()).trackOrder;
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
        <p className="mt-3 prose-muted">
          {copy.body}
        </p>
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
          <button type="submit" className="btn-primary w-full">
            {copy.submit}
          </button>
        </form>
      </div>
    </section>
  );
}

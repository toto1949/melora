import { trackOrderAction } from "@/lib/actions/orders";

export const metadata = { title: "Track Order" };

export default function TrackOrderPage() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-4xl text-navy">Track your order</h1>
        <p className="mt-3 prose-muted">
          Enter the order number from your confirmation email and the email used at checkout.
        </p>
        <form action={trackOrderAction} className="surface-card mt-8 space-y-4 p-6">
          <div>
            <label htmlFor="orderNumber" className="mb-1.5 block text-sm font-medium">
              Order number
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
              Email
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
            Track order
          </button>
        </form>
      </div>
    </section>
  );
}

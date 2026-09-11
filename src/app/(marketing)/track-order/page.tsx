import Link from "next/link";
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
  const messages = await getMessages();
  const copy = messages.trackOrder;
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
              placeholder="MTM-…"
              autoComplete="off"
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
        <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm prose-muted">{messages.v1.trackHelp}</p>
          <div className="mt-4 flex flex-wrap gap-3"><Link className="btn-secondary !px-4 text-sm" href="/auth/sign-in">{messages.v1.signIn}</Link><a className="inline-flex items-center p-2 text-sm font-semibold text-navy underline" href="mailto:hello@memoriestomelody.com">{messages.v1.support}</a></div>
        </div>
      </div>
    </section>
  );
}

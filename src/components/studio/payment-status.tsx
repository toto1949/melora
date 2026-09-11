"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PurchaseTracker } from "@/components/analytics/purchase-tracker";
type Status = {
  paymentStatus: string;
  status: string;
  retrying: boolean;
  listenUrl: string | null;
  checkoutUrl: string;
  transactionId: string;
  value: number;
  currency: string;
};
export function PaymentStatus({ orderId, cancelled = false }: { orderId?: string; cancelled?: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!orderId) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let polls = 0;
    async function poll() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId!)}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) { setError(true); return; }
        const next: Status = await response.json();
        setStatus(next);
        setError(false);
        if (++polls < 180 && !["refunded", "disputed", "partially_refunded"].includes(next.paymentStatus) && next.status !== "completed") timer = setTimeout(poll, 5000);
      } catch { if (!controller.signal.aborted) { setError(true); timer = setTimeout(poll, 10000); } }
    }
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [orderId]);
  const paid = status?.paymentStatus === "paid";
  const title = error || !orderId ? "Order verification required" : status?.listenUrl ? "Your song is ready" : paid ? status?.status === "failed" ? "Song generation needs attention" : "Payment confirmed — creating your song" : cancelled ? "Checkout cancelled" : "Confirming payment…";
  return <main className="atmosphere flex min-h-screen items-center justify-center px-4"><div className="surface-card max-w-lg p-8 text-center">
    {paid && status ? <PurchaseTracker transactionId={status.transactionId} value={status.value} currency={status.currency} /> : null}
    <h1 aria-live="polite" className="font-display text-3xl">{title}</h1>
    <p className="mt-4 text-muted">{error || !orderId ? "Open this page in the browser used to order, or sign in to the purchasing account. Contact support if you need help finding your order." : status?.paymentStatus === "disputed" || status?.paymentStatus?.includes("refunded") ? "This payment has been refunded or is under review. Contact support for assistance." : paid ? status?.status === "failed" ? "You will not be charged again. Contact support to review the generation job." : "We’ll email you when your song is ready. You can safely close this page." : "Song generation starts only after our server verifies payment with Stripe."}</p>
    {status?.retrying && <p className="mt-4">We’re retrying generation for this paid order. No additional payment is needed.</p>}
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {status?.listenUrl && <Link className="btn-primary" href={status.listenUrl}>Listen to your song</Link>}
      {status && ["pending", "failed"].includes(status.paymentStatus) && <Link className="btn-primary" href={status.checkoutUrl}>Return to checkout</Link>}
      <Link className="btn-secondary" href="/dashboard/orders">My orders</Link>
      <a className="btn-secondary" href="mailto:hello@memoriestomelody.com">Support</a>
    </div>
  </div></main>;
}

import { PaymentStatus } from "@/components/studio/payment-status";
export const metadata = { title: "Checkout cancelled | Memories to Melody", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ order_id?: string }> }) {
  return <PaymentStatus orderId={(await searchParams).order_id} cancelled />;
}

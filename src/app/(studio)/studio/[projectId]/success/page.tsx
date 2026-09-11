import { redirect } from "next/navigation";
export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const { orderId } = await searchParams;
  redirect(orderId ? `/payment-success?order_id=${encodeURIComponent(orderId)}` : "/payment-success");
}

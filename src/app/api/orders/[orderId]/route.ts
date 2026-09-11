import { getOrder, listOrderJobs } from "@/lib/db/repository";
import { getCurrentUser, getGuestToken } from "@/lib/auth/session";
import { ownsOrder } from "@/lib/security/ownership";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  if (!z.uuid().safeParse(orderId).success) return Response.json({ error: "Not found" }, { status: 404 });
  const [order, user, guest] = await Promise.all([getOrder(orderId), getCurrentUser(), getGuestToken()]);
  if (!order || !ownsOrder(order, user, guest)) return Response.json({ error: "Not found" }, { status: 404 });
  const jobs = await listOrderJobs(order.id);
  return Response.json({
    paymentStatus: order.paymentStatus ?? "pending", status: order.status,
    retrying: jobs.some(job => job.status === "failed" && job.attempt < job.maxAttempts),
    listenUrl: order.paymentStatus === "paid" && ["ready", "completed"].includes(order.status) ? `/listen/${order.shareToken}` : null,
    checkoutUrl: `/studio/${order.projectId}/checkout`,
  }, { headers: { "Cache-Control": "private, no-store" } });
}

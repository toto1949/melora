"use server";

import { redirect } from "next/navigation";
import { getOrderByNumber } from "@/lib/db/repository";
import { trackOrderSchema } from "@/lib/validation/studio";
import { createRevision, getOrder } from "@/lib/db/repository";
import { getGuestToken } from "@/lib/auth/session";
import { ownsOrder } from "@/lib/security/ownership";
import { rateLimit } from "@/lib/security/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";
import { revisionSchema } from "@/lib/validation/studio";
import { sendEmail } from "@/lib/email/send";
import { getEnv } from "@/lib/env";

export async function trackOrderAction(formData: FormData) {
  const result = trackOrderSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    email: formData.get("email"),
  });
  if (!result.success) redirect("/track-order?error=invalid");
  const parsed = result.data;
  if (!(await rateLimit(`track:${parsed.orderNumber}`, 5, 60_000)).success) redirect("/track-order?error=not_found");
  const order = await getOrderByNumber(parsed.orderNumber, parsed.email);
  if (!order || !ownsOrder(order, await getCurrentUser(), await getGuestToken())) {
    redirect("/track-order?error=not_found");
  }
  redirect(`/listen/${order.shareToken}`);
}

export async function requestRevisionAction(orderId: string, formData: FormData) {
  const user = await getCurrentUser();
  const order = await getOrder(orderId);
  if (!order) throw new Error("Order not found");
  if (!ownsOrder(order, user, await getGuestToken()) || order.paymentStatus !== "paid") {
    throw new Error("Forbidden");
  }

  const parsed = revisionSchema.parse({
    categories: formData.getAll("categories"),
    notes: formData.get("notes"),
    timestamps: String(formData.get("timestamps") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  });

  await createRevision({
    orderId,
    userId: user?.id ?? null,
    categories: parsed.categories,
    notes: parsed.notes,
    timestamps: parsed.timestamps,
  });

  await sendEmail({
    to: order.email,
    template: "revision-received",
    data: { orderNumber: order.orderNumber },
  });

  redirect(`/dashboard/orders/${orderId}/revisions`);
}

export async function getListenUrl(shareToken: string) {
  const env = getEnv();
  return `${env.NEXT_PUBLIC_APP_URL}/listen/${shareToken}`;
}

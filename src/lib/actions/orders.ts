"use server";

import { redirect } from "next/navigation";
import { getOrderByNumber } from "@/lib/db/repository";
import { trackOrderSchema } from "@/lib/validation/studio";
import { createRevision, getOrder, updateOrderPrivacy } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/auth/session";
import { revisionSchema } from "@/lib/validation/studio";
import { sendEmail } from "@/lib/email/send";
import { getEnv } from "@/lib/env";

export async function trackOrderAction(formData: FormData) {
  const parsed = trackOrderSchema.parse({
    orderNumber: formData.get("orderNumber"),
    email: formData.get("email"),
  });
  const order = await getOrderByNumber(parsed.orderNumber, parsed.email);
  if (!order) {
    redirect("/track-order?error=not_found");
  }
  redirect(`/listen/${order.shareToken}`);
}

export async function requestRevisionAction(orderId: string, formData: FormData) {
  const user = await getCurrentUser();
  const order = await getOrder(orderId);
  if (!order) throw new Error("Order not found");
  if (user && order.userId && user.id !== order.userId && user.role === "customer") {
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

export async function updatePrivacyAction(orderId: string, formData: FormData) {
  const user = await getCurrentUser();
  const order = await getOrder(orderId);
  if (!order) throw new Error("Order not found");
  if (!user || (order.userId && user.id !== order.userId && user.role === "customer")) {
    throw new Error("Forbidden");
  }
  const privacyMode = String(formData.get("privacyMode")) as
    | "private"
    | "password"
    | "unlisted"
    | "public";
  const giftRevealEnabled = formData.get("giftRevealEnabled") === "on";
  await updateOrderPrivacy(orderId, privacyMode, giftRevealEnabled);
  redirect(`/listen/${order.shareToken}`);
}

export async function getListenUrl(shareToken: string) {
  const env = getEnv();
  return `${env.NEXT_PUBLIC_APP_URL}/listen/${shareToken}`;
}

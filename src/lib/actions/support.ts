"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { createTicket, getOrder } from "@/lib/db/repository";

export async function createTicketAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  const requestedOrderId = String(formData.get("orderId") || "");
  const order = requestedOrderId ? await getOrder(requestedOrderId) : null;
  const orderId = order && (order.userId === user.id || user.role !== "customer") ? order.id : null;
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (subject.length < 3 || body.length < 10) redirect(`/dashboard/support?${orderId ? `orderId=${orderId}&` : ""}error=invalid`);
  await createTicket({
    userId: user.id,
    orderId,
    email: user.email,
    subject,
    body,
  });
  redirect("/dashboard/support?sent=1");
}

"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { createTicket } from "@/lib/db/repository";

export async function createTicketAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  await createTicket({
    userId: user.id,
    orderId: null,
    email: user.email,
    subject: String(formData.get("subject") || "Support request"),
    body: String(formData.get("body") || ""),
  });
  redirect("/dashboard/support?sent=1");
}

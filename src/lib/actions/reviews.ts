"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { OCCASIONS } from "@/lib/constants";
import { createReview, getOrder, getOrderReview } from "@/lib/db/repository";

const REVIEWABLE_STATUSES = new Set(["ready", "completed"]);

export async function submitReviewAction(orderId: string, formData: FormData) {
  const user = await getCurrentUser();
  const order = await getOrder(orderId);
  if (!order || !user || (order.userId && order.userId !== user.id && user.role === "customer")) {
    redirect("/dashboard/orders");
  }

  const back = `/dashboard/orders/${orderId}`;
  const fail = (message: string) => redirect(`${back}?reviewError=${encodeURIComponent(message)}`);

  if (!REVIEWABLE_STATUSES.has(order.status)) {
    fail("You can leave a review once your song is ready.");
  }
  if (await getOrderReview(orderId)) {
    fail("You already reviewed this order — thank you!");
  }

  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") || "").trim();
  const customerName =
    String(formData.get("customerName") || "").trim() || user.fullName || "Verified customer";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    fail("Please choose a star rating.");
  }
  if (body.length < 10) {
    fail("Please share at least a sentence about your experience.");
  }
  if (body.length > 1200) {
    fail("Reviews are limited to 1200 characters.");
  }

  const occasionSlug = order.project?.occasion;
  const occasionName = OCCASIONS.find((o) => o.slug === occasionSlug)?.name ?? null;

  await createReview({
    orderId,
    userId: user.id,
    customerName,
    occasion: occasionName,
    rating,
    body,
  });

  revalidatePath(back);
  revalidatePath("/reviews");
  revalidatePath("/");
  redirect(`${back}?reviewed=1`);
}

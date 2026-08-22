"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createTicket, trackEvent } from "@/lib/db/repository";
import { rateLimit } from "@/lib/security/rate-limit";

const feedbackSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  rating: z.coerce.number().int().min(1).max(5),
  topic: z.enum(["creation", "checkout", "progress", "listening", "accessibility", "other"]),
  body: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional(),
});

export async function submitBetaFeedbackAction(formData: FormData) {
  const parsed = feedbackSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    rating: formData.get("rating"),
    topic: formData.get("topic"),
    body: formData.get("body"),
    website: formData.get("website") || "",
  });

  if (!parsed.success) {
    redirect(`/feedback?error=${encodeURIComponent("Please complete every field and share at least one sentence.")}`);
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const limit = await rateLimit(`beta-feedback:${ip}`, 4, 60 * 60 * 1000);
  if (!limit.success) {
    redirect(`/feedback?error=${encodeURIComponent("Feedback limit reached. Please try again later.")}`);
  }

  const user = await getCurrentUser();
  const { name, email, rating, topic, body } = parsed.data;
  await createTicket({
    userId: user?.id ?? null,
    orderId: null,
    email,
    subject: `[Beta feedback] ${topic} · ${rating}/5`,
    body: `Tester: ${name}\nArea: ${topic}\nRating: ${rating}/5\n\n${body}`,
  });
  await trackEvent("beta_feedback_submitted", { topic, rating }, { userId: user?.id });
  redirect("/feedback?sent=1");
}

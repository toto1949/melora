import { Testimonials } from "@/components/marketing/sections";
import { listReviews } from "@/lib/db/repository";

export const metadata = {
  title: "Customer Reviews",
  description:
    "Read what customers say about gifting a personalized song — real reactions from birthdays, anniversaries, weddings, and more.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const reviews = await listReviews(20);
  return <Testimonials reviews={reviews.items} showEmptyState />;
}

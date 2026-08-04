import { Testimonials } from "@/components/marketing/sections";
import { listReviews } from "@/lib/db/repository";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const reviews = await listReviews(20);
  return <Testimonials reviews={reviews.items} />;
}

import { OccasionsSection } from "@/components/marketing/sections";

export const metadata = {
  title: "Occasions",
  description:
    "Personalized songs for birthdays, anniversaries, weddings, memorials, and every moment worth keeping — find the occasion that fits your story.",
  alternates: { canonical: "/occasions" },
};

export default function OccasionsPage() {
  return <OccasionsSection />;
}

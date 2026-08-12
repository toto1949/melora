import { FinalCta, HowItWorks } from "@/components/marketing/sections";

export const metadata = {
  title: "How It Works",
  description:
    "Share your story, choose your sound, and receive a personalized song within 48 hours — see the four simple steps from memory to melody.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorks />
      <FinalCta />
    </>
  );
}

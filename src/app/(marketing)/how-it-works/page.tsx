import { HowItWorks } from "@/components/marketing/sections";
import { AudioLaunchFinalCta } from "@/components/marketing/audio-launch-final-cta";

export const metadata = {
  title: "How It Works",
  description:
    "Share your story, choose your sound, and receive a personalized audio song within 48 hours — see the simple steps from memory to melody.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorks />
      <AudioLaunchFinalCta />
    </>
  );
}

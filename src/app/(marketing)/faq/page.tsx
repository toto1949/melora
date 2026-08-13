import { FaqSection } from "@/components/marketing/sections";
import { listFaqs } from "@/lib/db/repository";
import { getEnv } from "@/lib/env";
import { filterFaqsForRelease } from "@/lib/features";

export const metadata = {
  title: "FAQ",
  description:
    "Answers about how personalized songs are created, delivery times, revisions, licensing, and privacy at Memories to Melody.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = filterFaqsForRelease(
    await listFaqs(),
    getEnv().VIDEO_FEATURE_ENABLED,
  );
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <FaqSection faqs={faqs} />
    </>
  );
}

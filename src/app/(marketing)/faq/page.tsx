import { getMessages } from "@/lib/i18n";
import { localizeReleaseFaqs } from "@/lib/release";
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
  const faqs = localizeReleaseFaqs(filterFaqsForRelease(
    await listFaqs(),
    getEnv().VIDEO_FEATURE_ENABLED,
  ), await getMessages());
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      <FaqSection faqs={faqs} />
    </>
  );
}

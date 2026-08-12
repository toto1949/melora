import { Hero } from "@/components/marketing/hero";
import {
  FaqSection,
  FinalCta,
  HowItWorks,
  OccasionsSection,
  PricingSection,
  ProductShowcase,
  ReactionGallery,
  SampleSongsSection,
  Testimonials,
  TrustBar,
} from "@/components/marketing/sections";
import {
  getSettings,
  listFaqs,
  listPackages,
  listReactions,
  listReviews,
  listSamples,
} from "@/lib/db/repository";

export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [settings, packages, samples, reactions, reviews, faqs] = await Promise.all([
    getSettings(),
    listPackages(),
    listSamples(),
    listReactions(),
    listReviews(8),
    listFaqs(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.brandName,
    description: settings.heroSupporting,
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Hero settings={settings} />
      <TrustBar settings={settings} />
      <ReactionGallery reactions={reactions} />
      <HowItWorks />
      <SampleSongsSection samples={samples} />
      <OccasionsSection />
      <ProductShowcase />
      <Testimonials reviews={reviews.items} />
      <PricingSection packages={packages} />
      <FaqSection faqs={faqs} />
      <FinalCta />
    </>
  );
}

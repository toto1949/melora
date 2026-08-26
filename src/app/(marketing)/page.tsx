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
import { getEnv } from "@/lib/env";
import { filterFaqsForRelease, filterPackagesForRelease } from "@/lib/features";

export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const videoEnabled = getEnv().VIDEO_FEATURE_ENABLED;
  const [settings, packages, samples, reactions, reviews, faqs] = await Promise.all([
    getSettings(),
    listPackages(),
    listSamples(),
    listReactions(),
    listReviews(8),
    listFaqs(),
  ]);
  const releaseFaqs = filterFaqsForRelease(faqs, videoEnabled);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/#organization`,
        name: settings.brandName,
        description: settings.heroSupporting,
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        email: "hello@memoriestomelody.com",
      },
      {
        "@type": "WebSite",
        "@id": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/#website`,
        name: settings.brandName,
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        publisher: {
          "@id": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/#organization`,
        },
      },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: releaseFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Hero settings={settings} sample={samples[0]} />
      <TrustBar settings={settings} />
      <ReactionGallery reactions={reactions} />
      <HowItWorks />
      <SampleSongsSection samples={samples} />
      <OccasionsSection />
      <ProductShowcase videoEnabled={videoEnabled} />
      <Testimonials reviews={reviews.items} />
      <PricingSection packages={filterPackagesForRelease(packages, videoEnabled)} videoEnabled={videoEnabled} />
      <FaqSection faqs={releaseFaqs.slice(0, 6)} viewAllHref="/faq" />
      <FinalCta />
    </>
  );
}

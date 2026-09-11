import { getMessages } from "@/lib/i18n";
import { localizeReleaseFaqs, v1Packages } from "@/lib/release";
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
import { filterFaqsForRelease } from "@/lib/features";

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
  const releaseFaqs = localizeReleaseFaqs(filterFaqsForRelease(faqs, videoEnabled), await getMessages());

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/#organization`,
        name: "Memories to Melody",
        description: settings.heroSupporting,
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        email: "hello@memoriestomelody.com",
      },
      {
        "@type": "WebSite",
        "@id": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/#website`,
        name: "Memories to Melody",
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
    mainEntity: releaseFaqs.slice(0, 6).map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      <Hero settings={settings} sample={samples[0]} />
      <TrustBar />
      <ReactionGallery reactions={reactions} />
      <HowItWorks />
      <SampleSongsSection samples={samples} />
      <OccasionsSection />
      <ProductShowcase videoEnabled={videoEnabled} />
      <Testimonials reviews={reviews.items} />
      <PricingSection packages={v1Packages(packages)} videoEnabled={videoEnabled} />
      <FaqSection faqs={releaseFaqs.slice(0, 6)} viewAllHref="/faq" />
      <FinalCta />
    </>
  );
}

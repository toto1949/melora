import { AudioLaunchOffer } from "@/components/marketing/audio-launch-offer";
import { listPackages } from "@/lib/db/repository";
import { getEnv } from "@/lib/env";
import { filterPackagesForRelease } from "@/lib/features";

export const metadata = {
  title: "Pricing",
  description:
    "Launch pricing for one personalized audio song with custom lyrics, MP3 download, private listening, and one guided revision. One-time payment, no subscription.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const videoEnabled = getEnv().VIDEO_FEATURE_ENABLED;
  const launchPackage = filterPackagesForRelease(await listPackages(), videoEnabled)[0];
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const productLd = launchPackage
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: launchPackage.name,
        brand: { "@type": "Brand", name: "Memories to Melody" },
        description: launchPackage.description,
        url: `${base}/pricing`,
        offers: {
          "@type": "Offer",
          name: launchPackage.name,
          price: (launchPackage.priceCents / 100).toFixed(2),
          priceCurrency: launchPackage.currency?.toUpperCase() || "USD",
          availability: "https://schema.org/InStock",
          url: `${base}/studio?package=${launchPackage.slug}`,
        },
      }
    : null;

  return (
    <>
      {productLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      ) : null}
      <AudioLaunchOffer pkg={launchPackage} />
    </>
  );
}

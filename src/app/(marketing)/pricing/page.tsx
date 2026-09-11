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
  const serviceLd = launchPackage
    ? {
        "@context": "https://schema.org",
        "@type": "Service",
        name: launchPackage.name,
        serviceType: "Personalized song creation service",
        provider: {
          "@type": "Organization",
          name: "Memories to Melody",
          url: base,
        },
        description: launchPackage.description,
        url: `${base}/pricing`,
        offers: {
          "@type": "Offer",
          name: launchPackage.name,
          price: (launchPackage.priceCents / 100).toFixed(2),
          priceCurrency: launchPackage.currency?.toUpperCase() || "USD",
          url: `${base}/studio?package=${launchPackage.slug}`,
        },
      }
    : null;

  return (
    <>
      {serviceLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      ) : null}
      <AudioLaunchOffer pkg={launchPackage} />
    </>
  );
}

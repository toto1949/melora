import { PricingSection } from "@/components/marketing/sections";
import { listPackages } from "@/lib/db/repository";

export const metadata = {
  title: "Pricing",
  description:
    "One-time pricing for personalized songs — custom lyrics, studio-quality audio, private listening pages, and optional videos. No subscription.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const packages = await listPackages();
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Personalized Song",
    brand: { "@type": "Brand", name: "Memories to Melody" },
    description:
      "A custom song created from your memories: personalized lyrics, studio-quality audio, and a private listening page.",
    url: `${base}/pricing`,
    offers: packages.map((pkg) => ({
      "@type": "Offer",
      name: pkg.name,
      price: (pkg.priceCents / 100).toFixed(2),
      priceCurrency: pkg.currency?.toUpperCase() || "USD",
      availability: "https://schema.org/InStock",
      url: `${base}/studio?package=${pkg.slug}`,
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <PricingSection packages={packages} />
    </>
  );
}

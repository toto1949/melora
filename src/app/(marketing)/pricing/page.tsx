import { PricingSection } from "@/components/marketing/sections";
import { listPackages } from "@/lib/db/repository";

export const metadata = { title: "Pricing" };

export default async function PricingPage() {
  const packages = await listPackages();
  return <PricingSection packages={packages} />;
}

import { FaqSection } from "@/components/marketing/sections";
import { listFaqs } from "@/lib/db/repository";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const faqs = await listFaqs();
  return <FaqSection faqs={faqs} />;
}

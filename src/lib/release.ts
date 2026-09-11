import en from "../../messages/en.json";
import type { Messages } from "@/lib/i18n";
import type { FaqItem, Package } from "@/types";
import { SONG_CURRENCY, SONG_PACKAGE_SLUG, SONG_PRICE_CENTS } from "@/lib/pricing";

export { SONG_CURRENCY, SONG_PACKAGE_SLUG, SONG_PRICE_CENTS } from "@/lib/pricing";

/** The purchasable v1 offer; historical packages remain available to existing orders. */
export function v1Packages(packages: Package[]) {
  return packages.filter(pkg => pkg.isActive && pkg.slug === SONG_PACKAGE_SLUG)
    .map(pkg => ({ ...pkg, priceCents: SONG_PRICE_CENTS, currency: SONG_CURRENCY }));
}

/** Seeded CMS rows have UUIDs in Supabase; match their stable question as well as seed IDs. */
export function localizeReleaseFaqs(faqs: FaqItem[], messages: Messages): FaqItem[] {
  return faqs.map(faq => {
    const aliases: Record<string, keyof Messages["faq"]["items"]> = {
      "How are Memories to Melody songs generated?": "faq-1",
      "How long does delivery take?": "faq-2",
      "Who owns the music?": "faq-7",
    };
    const key = aliases[faq.question] ?? Object.entries(en.faq.items).find(([id, item]) =>
      id === faq.id || item.question.trim().toLowerCase() === faq.question.trim().toLowerCase()
    )?.[0] as keyof Messages["faq"]["items"] | undefined;
    return key ? { ...faq, ...messages.faq.items[key] } : faq;
  });
}

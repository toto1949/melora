import { describe, expect, it } from "vitest";
import { localizeReleaseFaqs, v1Packages } from "@/lib/release";
import { seedPackages } from "@/lib/db/seed-data";
import en from "../messages/en.json";

describe("v1 public offer", () => {
  it("offers only the configured 1999 USD song without mutating historical catalog prices", () => {
    const catalog = seedPackages.map(p => ({ ...p, priceCents: 3900 }));
    expect(v1Packages(catalog).map(p => [p.slug, p.priceCents, p.currency])).toEqual([["essential-song",1999,"usd"]]);
    expect(catalog.every(p => p.priceCents === 3900)).toBe(true);
  });
  it("respects an inactive base product", () => {
    expect(v1Packages(seedPackages.map(p => ({ ...p, isActive: false })))).toEqual([]);
  });
  it("uses release copy for UUID CMS rows and preserves custom FAQs", () => {
    const known = { id:"a8b030b5-2fd8-46f2-9a70-845a68e986ea", question:en.faq.items["faq-10"].question, answer:"Old package promises", category:"product", sortOrder:10 };
    const custom = { ...known, id:"custom", question:"A custom question?", answer:"A custom answer." };
    expect(localizeReleaseFaqs([{...known,question:"How long does delivery take?"}],en)[0].answer).toBe(en.faq.items["faq-2"].answer);
    expect(localizeReleaseFaqs([known,custom],en)).toEqual([{...known,...en.faq.items["faq-10"]},custom]);
  });
});

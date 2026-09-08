import { describe, expect, it } from "vitest";
import { filterFaqsForRelease, filterPackagesForRelease, packageAvailableForRelease } from "@/lib/features";
import { seedPackages } from "@/lib/db/seed-data";
import type { Package } from "@/types";

function pkg(overrides: Partial<Package>): Package {
  return {
    id: "pkg",
    slug: "essential-song",
    name: "Essential",
    description: "Song",
    priceCents: 3900,
    currency: "usd",
    features: [],
    revisionCredits: 1,
    includesVideo: false,
    includesWav: false,
    includesLyricVideo: false,
    songVariations: 1,
    deliveryHours: 48,
    stripePriceId: null,
    isActive: true,
    sortOrder: 1,
    ...overrides,
  };
}

describe("single audio launch gating", () => {
  it("allows only the Essential audio package during launch", () => {
    expect(packageAvailableForRelease(pkg({ slug: "essential-song" }), false)).toBe(true);
    expect(packageAvailableForRelease(pkg({ slug: "premium-story" }), false)).toBe(false);
    expect(packageAvailableForRelease(pkg({ slug: "cinematic-memory", includesVideo: true }), false)).toBe(false);
  });

  it("keeps the single launch package even if video configuration changes", () => {
    const packages = [
      pkg({ id: "essential", slug: "essential-song" }),
      pkg({ id: "premium", slug: "premium-story" }),
      pkg({ id: "cinematic", slug: "cinematic-memory", includesVideo: true, includesLyricVideo: true }),
    ];
    expect(filterPackagesForRelease(packages, false).map((item) => item.id)).toEqual(["essential"]);
    expect(filterPackagesForRelease(packages, true).map((item) => item.id)).toEqual(["essential"]);
  });

  it("does not advertise unreleased video or higher-package FAQs", () => {
    const faqs = [
      { id: "song", question: "How is my song made?", answer: "From your story.", category: "product", sortOrder: 1 },
      { id: "video", question: "How are videos made?", answer: "From photos.", category: "product", sortOrder: 2 },
      { id: "premium", question: "What do higher packages include?", answer: "Priority delivery.", category: "product", sortOrder: 3 },
    ];
    expect(filterFaqsForRelease(faqs, false).map((faq) => faq.id)).toEqual(["song"]);
  });

  it("selects only Essential from the current seed catalog", () => {
    expect(filterPackagesForRelease(seedPackages, false).map((item) => item.slug)).toEqual(["essential-song"]);
  });
});

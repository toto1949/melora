import { describe, expect, it } from "vitest";
import { filterFaqsForRelease, filterPackagesForRelease, packageAvailableForRelease } from "@/lib/features";
import type { Package } from "@/types";

function pkg(overrides: Partial<Package>): Package {
  return {
    id: "pkg",
    slug: "essential",
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

describe("video release gating", () => {
  it("keeps video packages unavailable while the feature is disabled", () => {
    expect(packageAvailableForRelease(pkg({ includesVideo: true }), false)).toBe(false);
    expect(packageAvailableForRelease(pkg({ includesLyricVideo: true }), false)).toBe(false);
    expect(packageAvailableForRelease(pkg({}), false)).toBe(true);
  });

  it("restores all packages when the video release is enabled", () => {
    const packages = [pkg({ id: "audio" }), pkg({ id: "video", includesVideo: true })];
    expect(filterPackagesForRelease(packages, true)).toHaveLength(2);
    expect(filterPackagesForRelease(packages, false).map((item) => item.id)).toEqual(["audio"]);
  });

  it("does not advertise unreleased video FAQs", () => {
    const faqs = [
      { id: "song", question: "How is my song made?", answer: "From your story.", category: "product", sortOrder: 1 },
      { id: "video", question: "How are videos made?", answer: "From photos.", category: "product", sortOrder: 2 },
    ];
    expect(filterFaqsForRelease(faqs, false).map((faq) => faq.id)).toEqual(["song"]);
    expect(filterFaqsForRelease(faqs, true)).toHaveLength(2);
  });
});

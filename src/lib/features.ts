import type { FaqItem, Package } from "@/types";

export function packageAvailableForRelease(pkg: Package, videoEnabled: boolean) {
  return videoEnabled || (!pkg.includesVideo && !pkg.includesLyricVideo);
}

export function filterPackagesForRelease(packages: Package[], videoEnabled: boolean) {
  return packages.filter((pkg) => packageAvailableForRelease(pkg, videoEnabled));
}

export function filterFaqsForRelease(faqs: FaqItem[], videoEnabled: boolean) {
  if (videoEnabled) return faqs;
  return faqs.filter((faq) => !/\bvideos?\b/i.test(`${faq.question} ${faq.answer}`));
}

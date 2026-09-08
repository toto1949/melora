import type { FaqItem, Package } from "@/types";

export function packageAvailableForRelease(pkg: Package, videoEnabled: boolean) {
  if (!videoEnabled) return pkg.slug === "essential-song";
  return true;
}

export function filterPackagesForRelease(packages: Package[], videoEnabled: boolean) {
  return packages.filter((pkg) => packageAvailableForRelease(pkg, videoEnabled));
}

export function filterFaqsForRelease(faqs: FaqItem[], videoEnabled: boolean) {
  if (videoEnabled) return faqs;
  return faqs.filter((faq) => !/\b(videos?|higher packages?|premium packages?|wav|artwork|priority)\b/i.test(`${faq.question} ${faq.answer}`));
}

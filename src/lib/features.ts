import type { FaqItem, Package } from "@/types";
import { AUDIO_LAUNCH_SLUG } from "@/lib/launch-catalog";

export function packageAvailableForRelease(pkg: Package, _videoEnabled: boolean) {
  return pkg.slug === AUDIO_LAUNCH_SLUG && !pkg.includesVideo && !pkg.includesLyricVideo;
}

export function filterPackagesForRelease(packages: Package[], videoEnabled: boolean) {
  return packages.filter((pkg) => packageAvailableForRelease(pkg, videoEnabled));
}

export function filterFaqsForRelease(faqs: FaqItem[], _videoEnabled: boolean) {
  return faqs.filter((faq) => !/\b(videos?|higher packages?|premium packages?|wav|artwork|priority)\b/i.test(`${faq.question} ${faq.answer}`));
}

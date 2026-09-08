import type { FaqItem, Package } from "@/types";
import { AUDIO_LAUNCH_SLUG } from "@/lib/launch-catalog";

export function packageAvailableForRelease(pkg: Package, _videoEnabled: boolean) {
  return pkg.slug === AUDIO_LAUNCH_SLUG && !pkg.includesVideo && !pkg.includesLyricVideo;
}

export function filterPackagesForRelease(packages: Package[], videoEnabled: boolean) {
  return packages.filter((pkg) => packageAvailableForRelease(pkg, videoEnabled));
}

export function filterFaqsForRelease(faqs: FaqItem[], _videoEnabled: boolean) {
  return faqs
    .filter((faq) => !/\b(videos?|higher packages?|premium packages?|wav|artwork|priority)\b/i.test(`${faq.question} ${faq.answer}`))
    .map((faq) => {
      if (/what if i want changes/i.test(faq.question)) {
        return {
          ...faq,
          answer:
            "Your $19 launch song includes one guided revision. From your dashboard you can request a focused change to lyrics, pronunciation, tempo, mood, vocals, or instrumentation, and we will prepare an updated version.",
        };
      }
      if (/what is included in each package/i.test(faq.question)) {
        return {
          ...faq,
          question: "What is included in the $19 launch offer?",
          answer:
            "The launch offer includes personalized lyrics, one complete personalized audio song, your choice of genre, mood, vocal style and language, an MP3 download, a private listening link, one guided revision, and standard delivery. It is a one-time $19 payment with no subscription.",
        };
      }
      if (/can i download the song and keep it forever/i.test(faq.question)) {
        return {
          ...faq,
          answer:
            "Yes. Your launch order includes an MP3 download, and your private listening page is designed so you can return to the song and share it with the people you choose.",
        };
      }
      return faq;
    });
}

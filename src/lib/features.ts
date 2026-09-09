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
    .map((faq) => {
      if (/how long until my song is ready/i.test(faq.question) || /how long does delivery take/i.test(faq.question)) {
        return {
          ...faq,
          answer:
            "Creation starts immediately after payment. Songs are usually ready within a few minutes, and the private listening page updates automatically as soon as yours is finished. If generation takes longer, you can follow progress from your dashboard and we will email you the moment it is ready.",
        };
      }
      if (/what if i want changes/i.test(faq.question)) {
        return {
          ...faq,
          answer:
            "Your $19 launch song includes one guided revision. From your dashboard you can request a focused change to lyrics, pronunciation, tempo, mood, vocals, or instrumentation, and we will prepare an updated version.",
        };
      }
      if (/how do i give the song as a gift/i.test(faq.question)) {
        return {
          ...faq,
          answer:
            "Your finished song comes with a private listening link you can send by text or email, or you can play it in person for the reveal. You can also download the MP3 to keep or share directly.",
        };
      }
      if (/is my story kept private/i.test(faq.question)) {
        return {
          ...faq,
          answer:
            "Yes. The story details you provide are used to create and support your song. Listening pages are private by default, and you control how the private link is shared.",
        };
      }
      if (/what is included in each package/i.test(faq.question) || /what is included in the \$19 launch offer/i.test(faq.question)) {
        return {
          ...faq,
          question: "What is included in the $19 launch offer?",
          answer:
            "The launch offer includes personalized lyrics, one complete personalized audio song, your choice of genre, mood, vocal style and language, an MP3 download, a private listening link, one guided revision, and automatic progress updates while your song is created. It is a one-time $19 payment with no subscription.",
        };
      }
      if (/can i download the song and keep it forever/i.test(faq.question)) {
        return {
          ...faq,
          answer:
            "Yes. Your launch order includes an MP3 download, and your private listening page gives you an easy way to return to the song and share it with the people you choose.",
        };
      }
      if (/what if i am not happy with the result/i.test(faq.question)) {
        return {
          ...faq,
          answer:
            "Start with the one guided revision included with your launch song. If a verified quality issue still cannot be resolved, our refund policy applies within 14 days of delivery.",
        };
      }
      return faq;
    })
    .filter((faq) => !/\b(videos?|higher packages?|premium packages?|wav|paid rush|rush fee)\b/i.test(`${faq.question} ${faq.answer}`));
}

import type { Package } from "@/types";

export const AUDIO_LAUNCH_SLUG = "essential-song";
export const AUDIO_LAUNCH_PRICE_CENTS = 1900;
export const AUDIO_LAUNCH_NAME = "Personalized Audio Song";
export const AUDIO_LAUNCH_DESCRIPTION =
  "A complete personalized audio song created from your memories, with private listening, MP3 download, and one guided revision.";

export const AUDIO_LAUNCH_FEATURES = [
  "Personalized lyrics built from your memories",
  "One complete personalized audio song",
  "Choice of genre, mood, vocal style, and language",
  "Private listening page",
  "MP3 download",
  "One guided revision",
  "Usually ready within a few minutes",
];

export function normalizeAudioLaunchPackage(pkg: Package): Package {
  if (pkg.slug !== AUDIO_LAUNCH_SLUG) return pkg;
  return {
    ...pkg,
    name: AUDIO_LAUNCH_NAME,
    description: AUDIO_LAUNCH_DESCRIPTION,
    priceCents: AUDIO_LAUNCH_PRICE_CENTS,
    features: AUDIO_LAUNCH_FEATURES,
    revisionCredits: 1,
    includesVideo: false,
    includesWav: false,
    includesLyricVideo: false,
    songVariations: 1,
    deliveryHours: 48,
    isActive: true,
  };
}

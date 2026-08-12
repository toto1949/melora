import type { OccasionSlug, GenreSlug } from "@/types";

export const BRAND = {
  name: "Memories to Melody",
  tagline: "Turn your memories into a song they'll keep forever.",
  supportEmail: "hello@memoriestomelody.com",
};

export const OCCASIONS: Array<{
  slug: OccasionSlug;
  name: string;
  description: string;
  emoji?: string;
}> = [
  { slug: "birthday", name: "Birthday", description: "A melody that makes their day unforgettable." },
  { slug: "anniversary", name: "Anniversary", description: "Celebrate the chapters you've written together." },
  { slug: "wedding", name: "Wedding", description: "A first dance, vow, or surprise from the heart." },
  { slug: "mothers-day", name: "Mother's Day", description: "Honor the person who held every season." },
  { slug: "fathers-day", name: "Father's Day", description: "Say what words alone never quite capture." },
  { slug: "graduation", name: "Graduation", description: "Mark the milestone with a song of pride." },
  { slug: "memorial", name: "Memorial", description: "A gentle tribute that keeps their light present." },
  { slug: "apology", name: "Apology", description: "Reach for repair with honesty and care." },
  { slug: "thank-you", name: "Thank You", description: "Gratitude, set to a voice they'll remember." },
  { slug: "friendship", name: "Friendship", description: "For the people who feel like home." },
  { slug: "new-baby", name: "New Baby", description: "Welcome a new life with a lullaby of love." },
  { slug: "just-because", name: "Just Because", description: "No occasion needed—only meaning." },
];

export const GENRES: Array<{ slug: GenreSlug; name: string; demoClip?: string }> = [
  { slug: "pop", name: "Pop" },
  { slug: "rnb", name: "R&B" },
  { slug: "country", name: "Country" },
  { slug: "acoustic", name: "Acoustic" },
  { slug: "rock", name: "Rock" },
  { slug: "hip-hop", name: "Hip-hop" },
  { slug: "soul", name: "Soul" },
  { slug: "jazz", name: "Jazz" },
  { slug: "classical", name: "Classical" },
  { slug: "gospel", name: "Gospel" },
  { slug: "electronic", name: "Electronic" },
  { slug: "indie", name: "Indie" },
  { slug: "latin", name: "Latin" },
  { slug: "afrobeats", name: "Afrobeats" },
  { slug: "arabic", name: "Arabic" },
  { slug: "custom", name: "Custom style" },
];

export const MOODS = [
  "Romantic",
  "Emotional",
  "Uplifting",
  "Nostalgic",
  "Playful",
  "Spiritual",
  "Tender",
  "Celebratory",
] as const;

export const VOCAL_TYPES = [
  "Female",
  "Male",
  "Soft female",
  "Warm male",
  "Duet",
  "Choir blend",
] as const;

export const LYRIC_TONES = [
  "Romantic",
  "Emotional",
  "Funny",
  "Inspirational",
  "Celebratory",
  "Spiritual",
  "Nostalgic",
  "Conversational",
  "Poetic",
] as const;

export const VIDEO_STYLES = [
  "Cinematic",
  "Romantic",
  "Documentary",
  "Vintage",
  "Dreamy",
  "Celebration",
  "Minimal lyric video",
] as const;

export const LANGUAGES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "fr", name: "French", dir: "ltr" },
  { code: "es", name: "Spanish", dir: "ltr" },
  { code: "ar", name: "Arabic", dir: "rtl" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  awaiting_payment: "Awaiting Payment",
  payment_confirmed: "Payment Confirmed",
  writing_lyrics: "Writing Lyrics",
  creating_music: "Creating Music",
  creating_video: "Creating Video",
  quality_review: "Quality Review",
  ready: "Ready",
  revision_requested: "Revision Requested",
  revising: "Revising",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};

export const STUDIO_STEPS = [
  { step: 1, key: "occasion", title: "Occasion", path: "occasion" },
  { step: 2, key: "recipient", title: "Recipient", path: "recipient" },
  { step: 3, key: "story", title: "Story", path: "story" },
  { step: 4, key: "style", title: "Song style", path: "style" },
  { step: 5, key: "lyrics", title: "Lyrics", path: "lyrics" },
  { step: 6, key: "media", title: "Photos & video", path: "media" },
  { step: 7, key: "review", title: "Review", path: "review" },
  { step: 8, key: "checkout", title: "Checkout", path: "checkout" },
] as const;

export const REVISION_CATEGORIES = [
  "Lyrics",
  "Pronunciation",
  "Genre",
  "Vocal",
  "Tempo",
  "Mood",
  "Instrumentation",
  "Video",
  "Other",
] as const;

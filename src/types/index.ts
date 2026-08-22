export type UserRole =
  | "customer"
  | "super_admin"
  | "support"
  | "producer"
  | "reviewer"
  | "content_manager";

export type ProjectStatus = "draft" | "awaiting_payment" | "abandoned" | "converted";

export type OrderStatus =
  | "draft"
  | "awaiting_payment"
  | "payment_confirmed"
  | "writing_lyrics"
  | "creating_music"
  | "creating_video"
  | "quality_review"
  | "ready"
  | "revision_requested"
  | "revising"
  | "completed"
  | "failed"
  | "refunded";

export type JobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "dead_letter"
  | "cancelled";

export type JobType =
  | "creative_brief"
  | "lyrics"
  | "music"
  | "cover_art"
  | "lyric_video"
  | "photo_video"
  | "quality_check"
  | "notify";

export type PrivacyMode = "private" | "password" | "unlisted" | "public";

export type OccasionSlug =
  | "birthday"
  | "anniversary"
  | "wedding"
  | "mothers-day"
  | "fathers-day"
  | "graduation"
  | "memorial"
  | "apology"
  | "thank-you"
  | "friendship"
  | "new-baby"
  | "just-because";

export type GenreSlug =
  | "pop"
  | "rnb"
  | "country"
  | "acoustic"
  | "rock"
  | "hip-hop"
  | "soul"
  | "jazz"
  | "classical"
  | "gospel"
  | "electronic"
  | "indie"
  | "latin"
  | "afrobeats"
  | "arabic"
  | "custom";

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  locale: string;
  currency: string;
  country: string | null;
  marketingOptIn: boolean;
  trainingOptIn: boolean;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Package {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  features: string[];
  revisionCredits: number;
  includesVideo: boolean;
  includesWav: boolean;
  includesLyricVideo: boolean;
  songVariations: number;
  deliveryHours: number;
  stripePriceId: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface AddOn {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Recipient {
  id: string;
  projectId: string;
  name: string;
  email: string | null;
  sendGiftEmail: boolean;
  pronunciation: string | null;
  relationship: string | null;
  pronouns: string | null;
  nickname: string | null;
  fromName: string | null;
}

export interface StoryAnswers {
  id: string;
  projectId: string;
  howTheyMet: string | null;
  favoriteMemory: string | null;
  importantDates: string | null;
  meaningfulPlaces: string | null;
  insideJokes: string | null;
  challengesOvercome: string | null;
  whatMakesSpecial: string | null;
  personalMessage: string | null;
}

export interface SongPreferences {
  id: string;
  projectId: string;
  genre: string | null;
  customStyle: string | null;
  mood: string | null;
  energy: string | null;
  tempo: string | null;
  vocalType: string | null;
  duetPreference: string | null;
  language: string;
  explicitContent: boolean;
  instruments: string[];
  lyricTone: string | null;
  mustInclude: string[];
  mustExclude: string[];
  chorusMessage: string | null;
  desiredLength: string | null;
  videoStyle: string | null;
}

export interface MediaUpload {
  id: string;
  projectId: string;
  userId: string | null;
  kind: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
  consentConfirmed: boolean;
  malwareScanStatus?: "pending" | "clean" | "infected" | "failed";
  url?: string;
}

export interface Project {
  id: string;
  userId: string | null;
  guestToken: string | null;
  status: ProjectStatus;
  currentStep: number;
  occasion: string | null;
  packageId: string | null;
  locale: string;
  estimatedMinutes: number;
  lastSavedAt: string;
  claimedAt: string | null;
  createdAt: string;
  updatedAt: string;
  recipient?: Recipient | null;
  story?: StoryAnswers | null;
  preferences?: SongPreferences | null;
  media?: MediaUpload[];
  package?: Package | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  projectId: string;
  packageId: string;
  couponId: string | null;
  status: OrderStatus;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  deliverySpeed: string;
  estimatedDeliveryAt: string | null;
  email: string;
  phone: string | null;
  revisionCreditsRemaining: number;
  shareToken: string;
  privacyMode: PrivacyMode;
  giftRevealEnabled: boolean;
  giftRevealMessage: string | null;
  creativeBrief: Record<string, unknown> | null;
  stripeCheckoutSessionId: string | null;
  idempotencyKey?: string;
  failedReason?: string | null;
  readyAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  project?: Project;
  package?: Package;
  currentVersion?: SongVersion | null;
}

export interface SongVersion {
  id: string;
  orderId: string;
  versionNumber: number;
  title: string;
  lyrics: string;
  timedLyrics: TimedLyricLine[] | null;
  audioUrl: string | null;
  coverUrl: string | null;
  videoUrl: string | null;
  genre: string | null;
  mood: string | null;
  vocalType: string | null;
  language: string | null;
  durationSeconds: number | null;
  isCurrent: boolean;
  createdAt: string;
}

export interface TimedLyricLine {
  start: number;
  end: number;
  text: string;
}

export interface GenerationJob {
  id: string;
  orderId: string;
  jobType: JobType;
  status: JobStatus;
  progress: number;
  attempt: number;
  maxAttempts: number;
  idempotencyKey: string;
  provider: string | null;
  providerJobId: string | null;
  error: string | null;
  nextRetryAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  occasion: string | null;
  rating: number;
  body: string;
  isVerifiedPurchase: boolean;
  isDemo: boolean;
  isPublished: boolean;
  mediaUrl: string | null;
  reviewedAt: string;
}

export interface SampleSong {
  id: string;
  slug: string;
  title: string;
  recipientType: string;
  occasion: string;
  genre: string;
  mood: string;
  vocalType: string;
  language: string;
  durationSeconds: number;
  coverUrl: string;
  audioUrl: string;
  lyricsPreview: string;
}

export interface ReactionVideo {
  id: string;
  customerFirstName: string;
  occasion: string;
  quote: string | null;
  thumbnailUrl: string;
  videoUrl: string;
  isDemo: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
}

export interface SiteSettings {
  songsCreated: number;
  averageRating: number;
  genresSupported: number;
  countriesServed: number;
  heroHeadline: string;
  heroSupporting: string;
  trustBadge: string;
  brandName: string;
  supportEmail: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  percentOff: number | null;
  amountOffCents: number | null;
  currency: string;
  maxRedemptions: number | null;
  redemptionCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string | null;
  orderId: string | null;
  email: string;
  subject: string;
  body: string;
  status: "open" | "pending" | "resolved" | "closed";
  createdAt: string;
}

export interface RevisionRequest {
  id: string;
  orderId: string;
  userId: string | null;
  status: "requested" | "in_progress" | "completed" | "rejected" | "cancelled";
  categories: string[];
  notes: string;
  timestamps: string[];
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  sessionId: string | null;
  userId: string | null;
  projectId: string | null;
  orderId: string | null;
  properties: Record<string, unknown>;
  createdAt: string;
}

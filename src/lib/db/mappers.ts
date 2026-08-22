import type {
  FaqItem,
  GenerationJob,
  Order,
  Package,
  Profile,
  Project,
  ReactionVideo,
  Recipient,
  Review,
  SampleSong,
  SiteSettings,
  SongPreferences,
  SongVersion,
  StoryAnswers,
  SupportTicket,
} from "@/types";

export function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: (row.full_name as string) ?? null,
    phone: (row.phone as string) ?? null,
    avatarUrl: (row.avatar_url as string) ?? null,
    role: row.role as Profile["role"],
    locale: row.locale as string,
    currency: row.currency as string,
    country: (row.country as string) ?? null,
    marketingOptIn: Boolean(row.marketing_opt_in),
    trainingOptIn: Boolean(row.training_opt_in),
    suspendedAt: (row.suspended_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    deletedAt: (row.deleted_at as string) ?? null,
  };
}

export function mapPackage(row: Record<string, unknown>): Package {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: row.description as string,
    priceCents: row.price_cents as number,
    currency: row.currency as string,
    features: (row.features as string[]) ?? [],
    revisionCredits: row.revision_credits as number,
    includesVideo: Boolean(row.includes_video),
    includesWav: Boolean(row.includes_wav),
    includesLyricVideo: Boolean(row.includes_lyric_video),
    songVariations: row.song_variations as number,
    deliveryHours: row.delivery_hours as number,
    stripePriceId: (row.stripe_price_id as string) ?? null,
    isActive: Boolean(row.is_active),
    sortOrder: row.sort_order as number,
  };
}

export function mapProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? null,
    guestToken: (row.guest_token as string) ?? null,
    status: row.status as Project["status"],
    currentStep: row.current_step as number,
    occasion: (row.occasion as string) ?? null,
    packageId: (row.package_id as string) ?? null,
    locale: row.locale as string,
    estimatedMinutes: row.estimated_minutes as number,
    lastSavedAt: row.last_saved_at as string,
    claimedAt: (row.claimed_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapRecipient(row: Record<string, unknown>): Recipient {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    name: row.name as string,
    email: (row.email as string) ?? null,
    sendGiftEmail: Boolean(row.send_gift_email),
    pronunciation: (row.pronunciation as string) ?? null,
    relationship: (row.relationship as string) ?? null,
    pronouns: (row.pronouns as string) ?? null,
    nickname: (row.nickname as string) ?? null,
    fromName: (row.from_name as string) ?? null,
  };
}

export function mapStory(row: Record<string, unknown>): StoryAnswers {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    howTheyMet: (row.how_they_met as string) ?? null,
    favoriteMemory: (row.favorite_memory as string) ?? null,
    importantDates: (row.important_dates as string) ?? null,
    meaningfulPlaces: (row.meaningful_places as string) ?? null,
    insideJokes: (row.inside_jokes as string) ?? null,
    challengesOvercome: (row.challenges_overcome as string) ?? null,
    whatMakesSpecial: (row.what_makes_special as string) ?? null,
    personalMessage: (row.personal_message as string) ?? null,
  };
}

export function mapPreferences(row: Record<string, unknown>): SongPreferences {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    genre: (row.genre as string) ?? null,
    customStyle: (row.custom_style as string) ?? null,
    mood: (row.mood as string) ?? null,
    energy: (row.energy as string) ?? null,
    tempo: (row.tempo as string) ?? null,
    vocalType: (row.vocal_type as string) ?? null,
    duetPreference: (row.duet_preference as string) ?? null,
    language: (row.language as string) ?? "en",
    explicitContent: Boolean(row.explicit_content),
    instruments: (row.instruments as string[]) ?? [],
    lyricTone: (row.lyric_tone as string) ?? null,
    mustInclude: (row.must_include as string[]) ?? [],
    mustExclude: (row.must_exclude as string[]) ?? [],
    chorusMessage: (row.chorus_message as string) ?? null,
    desiredLength: (row.desired_length as string) ?? null,
    videoStyle: (row.video_style as string) ?? null,
  };
}

export function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    userId: (row.user_id as string) ?? null,
    projectId: row.project_id as string,
    packageId: row.package_id as string,
    couponId: (row.coupon_id as string) ?? null,
    status: row.status as Order["status"],
    subtotalCents: row.subtotal_cents as number,
    discountCents: row.discount_cents as number,
    taxCents: row.tax_cents as number,
    totalCents: row.total_cents as number,
    currency: row.currency as string,
    deliverySpeed: row.delivery_speed as string,
    estimatedDeliveryAt: (row.estimated_delivery_at as string) ?? null,
    email: row.email as string,
    phone: (row.phone as string) ?? null,
    revisionCreditsRemaining: row.revision_credits_remaining as number,
    shareToken: row.share_token as string,
    privacyMode: row.privacy_mode as Order["privacyMode"],
    giftRevealEnabled: Boolean(row.gift_reveal_enabled),
    giftRevealMessage: (row.gift_reveal_message as string) ?? null,
    creativeBrief: (row.creative_brief as Record<string, unknown>) ?? null,
    stripeCheckoutSessionId: (row.stripe_checkout_session_id as string) ?? null,
    idempotencyKey: (row.idempotency_key as string) ?? undefined,
    failedReason: (row.failed_reason as string) ?? null,
    readyAt: (row.ready_at as string) ?? null,
    completedAt: (row.completed_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapSongVersion(row: Record<string, unknown>, urls?: Partial<SongVersion>): SongVersion {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    versionNumber: row.version_number as number,
    title: row.title as string,
    lyrics: row.lyrics as string,
    timedLyrics: (row.timed_lyrics as SongVersion["timedLyrics"]) ?? null,
    audioUrl: urls?.audioUrl ?? null,
    coverUrl: urls?.coverUrl ?? null,
    videoUrl: urls?.videoUrl ?? null,
    genre: (row.genre as string) ?? null,
    mood: (row.mood as string) ?? null,
    vocalType: (row.vocal_type as string) ?? null,
    language: (row.language as string) ?? null,
    durationSeconds: (row.duration_seconds as number) ?? null,
    isCurrent: Boolean(row.is_current),
    createdAt: row.created_at as string,
  };
}

export function mapJob(row: Record<string, unknown>): GenerationJob {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    jobType: row.job_type as GenerationJob["jobType"],
    status: row.status as GenerationJob["status"],
    progress: row.progress as number,
    attempt: row.attempt as number,
    maxAttempts: row.max_attempts as number,
    idempotencyKey: row.idempotency_key as string,
    provider: (row.provider as string) ?? null,
    providerJobId: (row.provider_job_id as string) ?? null,
    error: (row.error as string) ?? null,
    nextRetryAt: (row.next_retry_at as string) ?? null,
    startedAt: (row.started_at as string) ?? null,
    finishedAt: (row.finished_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    occasion: (row.occasion as string) ?? null,
    rating: row.rating as number,
    body: row.body as string,
    isVerifiedPurchase: Boolean(row.is_verified_purchase),
    isDemo: Boolean(row.is_demo),
    isPublished: Boolean(row.is_published),
    mediaUrl: (row.media_url as string) ?? null,
    reviewedAt: row.reviewed_at as string,
  };
}

export function mapSample(row: Record<string, unknown>): SampleSong {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    recipientType: row.recipient_type as string,
    occasion: row.occasion as string,
    genre: row.genre as string,
    mood: row.mood as string,
    vocalType: row.vocal_type as string,
    language: row.language as string,
    durationSeconds: row.duration_seconds as number,
    coverUrl: row.cover_url as string,
    audioUrl: row.audio_url as string,
    lyricsPreview: row.lyrics_preview as string,
  };
}

export function mapReaction(row: Record<string, unknown>): ReactionVideo {
  return {
    id: row.id as string,
    customerFirstName: row.customer_first_name as string,
    occasion: row.occasion as string,
    quote: (row.quote as string) ?? null,
    thumbnailUrl: row.thumbnail_url as string,
    videoUrl: row.video_url as string,
    isDemo: Boolean(row.is_demo),
  };
}

export function mapFaq(row: Record<string, unknown>): FaqItem {
  return {
    id: row.id as string,
    question: row.question as string,
    answer: row.answer as string,
    category: row.category as string,
    sortOrder: row.sort_order as number,
  };
}

export function mapTicket(row: Record<string, unknown>): SupportTicket {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? null,
    orderId: (row.order_id as string) ?? null,
    email: row.email as string,
    subject: row.subject as string,
    body: row.body as string,
    status: row.status as SupportTicket["status"],
    createdAt: row.created_at as string,
  };
}

export function mapSettings(rows: Array<{ key: string; value: unknown }>): SiteSettings {
  const stats = (rows.find((r) => r.key === "stats")?.value ?? {}) as Record<string, number>;
  const hero = (rows.find((r) => r.key === "hero")?.value ?? {}) as Record<string, string>;
  return {
    songsCreated: stats.songsCreated ?? 0,
    averageRating: stats.averageRating ?? 4.9,
    genresSupported: stats.genresSupported ?? 16,
    countriesServed: stats.countriesServed ?? 42,
    heroHeadline: hero.headline ?? "Turn your memories into a song they'll keep forever.",
    heroSupporting:
      hero.supporting ??
      "Share your story, choose your sound, and let our creative technology transform your favorite moments into a deeply personal song.",
    trustBadge: hero.trustBadge ?? "Personalized music made from your memories",
    brandName: hero.brandName ?? "Memories to Melody",
    supportEmail: hero.supportEmail ?? "hello@memoriestomelody.com",
  };
}

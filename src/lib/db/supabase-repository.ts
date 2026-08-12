import { nanoid } from "nanoid";
import type {
  AnalyticsEvent,
  GenerationJob,
  JobType,
  Order,
  OrderStatus,
  Package,
  PrivacyMode,
  Profile,
  Project,
  Recipient,
  RevisionRequest,
  SongPreferences,
  SongVersion,
  StoryAnswers,
  SupportTicket,
  UserRole,
} from "@/types";
import { getEnv } from "@/lib/env";
import { orderNumber } from "@/lib/utils";
import { getSupabaseAdmin } from "./client";
import {
  mapFaq,
  mapJob,
  mapOrder,
  mapPackage,
  mapPreferences,
  mapProfile,
  mapProject,
  mapReaction,
  mapRecipient,
  mapReview,
  mapSample,
  mapSettings,
  mapSongVersion,
  mapStory,
  mapTicket,
} from "./mappers";
import { getSignedAssetUrl } from "@/lib/storage/assets";

async function attachProject(project: Project): Promise<Project> {
  const sb = getSupabaseAdmin();
  const [recipient, story, preferences, media, pkg] = await Promise.all([
    sb.from("recipients").select("*").eq("project_id", project.id).maybeSingle(),
    sb.from("story_answers").select("*").eq("project_id", project.id).maybeSingle(),
    sb.from("song_preferences").select("*").eq("project_id", project.id).maybeSingle(),
    sb.from("media_uploads").select("*").eq("project_id", project.id).is("deleted_at", null).order("sort_order"),
    project.packageId
      ? sb.from("packages").select("*").eq("id", project.packageId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const mediaWithUrls = await Promise.all(
    (media.data ?? []).map(async (m) => ({
      id: m.id,
      projectId: m.project_id,
      userId: m.user_id,
      kind: m.kind,
      storagePath: m.storage_path,
      fileName: m.file_name,
      mimeType: m.mime_type,
      sizeBytes: m.size_bytes,
      sortOrder: m.sort_order,
      consentConfirmed: m.consent_confirmed,
      url: (await getSignedAssetUrl(m.storage_path)) ?? undefined,
    })),
  );

  return {
    ...project,
    recipient: recipient.data ? mapRecipient(recipient.data) : null,
    story: story.data ? mapStory(story.data) : null,
    preferences: preferences.data ? mapPreferences(preferences.data) : null,
    media: mediaWithUrls,
    package: pkg.data ? mapPackage(pkg.data) : null,
  };
}

async function attachOrder(order: Order): Promise<Order> {
  const sb = getSupabaseAdmin();
  const [projectRes, pkgRes, jobsRes, versionRes] = await Promise.all([
    sb.from("projects").select("*").eq("id", order.projectId).maybeSingle(),
    sb.from("packages").select("*").eq("id", order.packageId).maybeSingle(),
    sb.from("generation_jobs").select("*").eq("order_id", order.id),
    sb.from("song_versions").select("*").eq("order_id", order.id).eq("is_current", true).maybeSingle(),
  ]);

  const jobs = (jobsRes.data ?? []).map(mapJob);
  const progress =
    jobs.length === 0
      ? order.status === "ready" || order.status === "completed"
        ? 100
        : 0
      : Math.round(jobs.reduce((sum, j) => sum + j.progress, 0) / jobs.length);

  let currentVersion: SongVersion | null = null;
  if (versionRes.data) {
    const assets = await sb
      .from("generated_assets")
      .select("*")
      .eq("song_version_id", versionRes.data.id);
    const audio = assets.data?.find((a) => a.kind === "audio");
    const cover = assets.data?.find((a) => a.kind === "cover");
    const video = assets.data?.find((a) => a.kind === "music_video" || a.kind === "lyric_video");
    currentVersion = mapSongVersion(versionRes.data, {
      audioUrl: audio ? await getSignedAssetUrl(audio.storage_path) : null,
      coverUrl: cover ? await getSignedAssetUrl(cover.storage_path) : null,
      videoUrl: video ? await getSignedAssetUrl(video.storage_path) : null,
    });
  }

  const project = projectRes.data ? await attachProject(mapProject(projectRes.data)) : undefined;

  return {
    ...order,
    progress,
    project,
    package: pkgRes.data ? mapPackage(pkgRes.data) : undefined,
    currentVersion,
  };
}

export async function getSettings() {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("site_settings").select("key, value");
  return mapSettings(data ?? []);
}

export async function updateSettings(partial: Partial<Awaited<ReturnType<typeof getSettings>>>) {
  const current = await getSettings();
  const merged = { ...current, ...partial };
  const sb = getSupabaseAdmin();
  await sb.from("site_settings").upsert([
    {
      key: "stats",
      value: {
        songsCreated: merged.songsCreated,
        averageRating: merged.averageRating,
        genresSupported: merged.genresSupported,
        countriesServed: merged.countriesServed,
      },
    },
    {
      key: "hero",
      value: {
        headline: merged.heroHeadline,
        supporting: merged.heroSupporting,
        trustBadge: merged.trustBadge,
        brandName: merged.brandName,
        supportEmail: merged.supportEmail,
      },
    },
  ]);
  return merged;
}

export async function listPackages() {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order");
  return (data ?? []).map(mapPackage);
}

export async function getPackage(idOrSlug: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("packages")
    .select("*")
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .maybeSingle();
  return data ? mapPackage(data) : null;
}

export async function updatePackage(packageId: string, patch: Partial<Package>) {
  const sb = getSupabaseAdmin();
  const row: Record<string, unknown> = {};
  if (patch.priceCents != null) row.price_cents = patch.priceCents;
  if (patch.name != null) row.name = patch.name;
  if (patch.description != null) row.description = patch.description;
  const { data, error } = await sb.from("packages").update(row).eq("id", packageId).select().single();
  if (error || !data) return null;
  return mapPackage(data);
}

export async function listAddOns() {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("add_ons")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order");
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    priceCents: r.price_cents,
    currency: r.currency,
    isActive: r.is_active,
    sortOrder: r.sort_order,
  }));
}

export async function listSamples() {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("sample_songs").select("*").eq("is_published", true).order("sort_order");
  return (data ?? []).map(mapSample);
}

export async function listReactions() {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("reaction_videos").select("*").eq("is_published", true).order("sort_order");
  return (data ?? []).map(mapReaction);
}

export async function listReviews(limit = 10, offset = 0) {
  const sb = getSupabaseAdmin();
  const { data, count } = await sb
    .from("reviews")
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("reviewed_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return { items: (data ?? []).map(mapReview), total: count ?? 0 };
}

export async function listFaqs() {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("faq_items")
    .select("*")
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("sort_order");
  return (data ?? []).map(mapFaq);
}

export async function findCoupon(code: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  if (data.max_redemptions != null && data.redemption_count >= data.max_redemptions) return null;
  return {
    id: data.id,
    code: data.code,
    description: data.description,
    percentOff: data.percent_off,
    amountOffCents: data.amount_off_cents,
    currency: data.currency,
    maxRedemptions: data.max_redemptions,
    redemptionCount: data.redemption_count,
    expiresAt: data.expires_at,
    isActive: data.is_active,
  };
}

export async function createGuestProject(locale = "en") {
  const sb = getSupabaseAdmin();
  const guestToken = nanoid(32);
  const { data, error } = await sb
    .from("projects")
    .insert({
      guest_token: guestToken,
      status: "draft",
      current_step: 1,
      locale,
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create project");
  return attachProject(mapProject(data));
}

export async function getProject(projectId: string, guestToken?: string | null) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (!data) return null;
  if (guestToken && data.guest_token && data.guest_token !== guestToken && !data.user_id) return null;
  return attachProject(mapProject(data));
}

export async function getProjectByGuestToken(guestToken: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("projects").select("*").eq("guest_token", guestToken).maybeSingle();
  return data ? attachProject(mapProject(data)) : null;
}

export async function listUserProjects(userId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  return Promise.all((data ?? []).map((r) => attachProject(mapProject(r))));
}

export async function updateProjectStep(
  projectId: string,
  step: number,
  patch: Partial<Project> = {},
) {
  const sb = getSupabaseAdmin();
  const { data: existing } = await sb.from("projects").select("current_step").eq("id", projectId).single();
  const row: Record<string, unknown> = {
    last_saved_at: new Date().toISOString(),
    current_step: Math.max(existing?.current_step ?? 1, step),
  };
  if (patch.occasion != null) row.occasion = patch.occasion;
  if (patch.packageId != null) row.package_id = patch.packageId;
  if (patch.status != null) row.status = patch.status;
  const { data, error } = await sb.from("projects").update(row).eq("id", projectId).select().single();
  if (error || !data) return null;
  return attachProject(mapProject(data));
}

export async function upsertRecipient(
  projectId: string,
  data: Omit<Recipient, "id" | "projectId">,
) {
  const sb = getSupabaseAdmin();
  const { data: row, error } = await sb
    .from("recipients")
    .upsert(
      {
        project_id: projectId,
        name: data.name,
        pronunciation: data.pronunciation,
        relationship: data.relationship,
        pronouns: data.pronouns,
        nickname: data.nickname,
        from_name: data.fromName,
      },
      { onConflict: "project_id" },
    )
    .select()
    .single();
  if (error || !row) throw new Error(error?.message ?? "Failed to save recipient");
  return mapRecipient(row);
}

export async function upsertStory(
  projectId: string,
  data: Omit<StoryAnswers, "id" | "projectId">,
) {
  const sb = getSupabaseAdmin();
  const { data: row, error } = await sb
    .from("story_answers")
    .upsert(
      {
        project_id: projectId,
        how_they_met: data.howTheyMet,
        favorite_memory: data.favoriteMemory,
        important_dates: data.importantDates,
        meaningful_places: data.meaningfulPlaces,
        inside_jokes: data.insideJokes,
        challenges_overcome: data.challengesOvercome,
        what_makes_special: data.whatMakesSpecial,
        personal_message: data.personalMessage,
      },
      { onConflict: "project_id" },
    )
    .select()
    .single();
  if (error || !row) throw new Error(error?.message ?? "Failed to save story");
  return mapStory(row);
}

export async function upsertPreferences(
  projectId: string,
  data: Omit<SongPreferences, "id" | "projectId">,
) {
  const sb = getSupabaseAdmin();
  const { data: row, error } = await sb
    .from("song_preferences")
    .upsert(
      {
        project_id: projectId,
        genre: data.genre,
        custom_style: data.customStyle,
        mood: data.mood,
        energy: data.energy,
        tempo: data.tempo,
        vocal_type: data.vocalType,
        duet_preference: data.duetPreference,
        language: data.language,
        explicit_content: data.explicitContent,
        instruments: data.instruments,
        lyric_tone: data.lyricTone,
        must_include: data.mustInclude,
        must_exclude: data.mustExclude,
        chorus_message: data.chorusMessage,
        desired_length: data.desiredLength,
        video_style: data.videoStyle,
      },
      { onConflict: "project_id" },
    )
    .select()
    .single();
  if (error || !row) throw new Error(error?.message ?? "Failed to save preferences");
  return mapPreferences(row);
}

export async function addMedia(
  projectId: string,
  media: Omit<import("@/types").MediaUpload, "id" | "projectId">,
) {
  const sb = getSupabaseAdmin();
  const { data: row, error } = await sb
    .from("media_uploads")
    .insert({
      project_id: projectId,
      user_id: media.userId,
      kind: media.kind,
      storage_path: media.storagePath,
      file_name: media.fileName,
      mime_type: media.mimeType,
      size_bytes: media.sizeBytes,
      sort_order: media.sortOrder,
      consent_confirmed: media.consentConfirmed,
    })
    .select()
    .single();
  if (error || !row) throw new Error(error?.message ?? "Failed to save media");
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    kind: row.kind,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    sortOrder: row.sort_order,
    consentConfirmed: row.consent_confirmed,
    url: await getSignedAssetUrl(row.storage_path),
  };
}

export async function reorderMedia(projectId: string, orderedIds: string[]) {
  const sb = getSupabaseAdmin();
  await Promise.all(
    orderedIds.map((id, index) =>
      sb.from("media_uploads").update({ sort_order: index }).eq("id", id).eq("project_id", projectId),
    ),
  );
  const { data } = await sb.from("media_uploads").select("*").eq("project_id", projectId);
  return data ?? [];
}

export async function claimProject(projectId: string, userId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("projects")
    .update({ user_id: userId, claimed_at: new Date().toISOString() })
    .eq("id", projectId)
    .select()
    .single();
  if (error || !data) return null;
  return attachProject(mapProject(data));
}

export async function createOrGetProfile(input: {
  id?: string;
  email: string;
  fullName?: string | null;
  role?: UserRole;
}) {
  const sb = getSupabaseAdmin();
  const { data: existing } = await sb.from("profiles").select("*").eq("email", input.email.toLowerCase()).maybeSingle();
  if (existing) return mapProfile(existing);

  const { data, error } = await sb
    .from("profiles")
    .insert({
      id: input.id,
      email: input.email.toLowerCase(),
      full_name: input.fullName,
      role: input.role ?? "customer",
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create profile");
  return mapProfile(data);
}

export async function getProfile(userId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data ? mapProfile(data) : null;
}

export async function getProfileByEmail(email: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("profiles").select("*").ilike("email", email).maybeSingle();
  return data ? mapProfile(data) : null;
}

// Session auth handled by Supabase Auth — stubs for interface compatibility
export async function createSession(_userId: string) {
  throw new Error("Use Supabase Auth sessions in production");
}

export async function getSessionUser(_token: string | undefined | null) {
  return null;
}

export async function destroySession(_token: string) {
  return;
}

export async function createOrder(input: {
  projectId: string;
  packageId: string;
  email: string;
  phone?: string | null;
  userId?: string | null;
  couponCode?: string | null;
  addOnIds?: string[];
  deliverySpeed?: string;
  idempotencyKey: string;
}) {
  const sb = getSupabaseAdmin();
  const { data: existing } = await sb
    .from("orders")
    .select("*")
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();
  if (existing) return attachOrder(mapOrder(existing));

  const pkg = await getPackage(input.packageId);
  if (!pkg) throw new Error("Package not found");
  const addOns = await listAddOns();
  const selected = addOns.filter((a) => input.addOnIds?.includes(a.id));
  const subtotal = pkg.priceCents + selected.reduce((s, a) => s + a.priceCents, 0);

  let discount = 0;
  let couponId: string | null = null;
  if (input.couponCode) {
    const coupon = await findCoupon(input.couponCode);
    if (coupon) {
      couponId = coupon.id;
      if (coupon.percentOff) discount = Math.round((subtotal * coupon.percentOff) / 100);
      if (coupon.amountOffCents) discount = Math.min(subtotal, coupon.amountOffCents);
      await sb
        .from("coupons")
        .update({ redemption_count: coupon.redemptionCount + 1 })
        .eq("id", coupon.id);
    }
  }

  const tax = Math.round((subtotal - discount) * 0.08);
  const total = subtotal - discount + tax;
  const deliveryHours =
    input.deliverySpeed === "rush" ? Math.max(6, Math.floor(pkg.deliveryHours / 2)) : pkg.deliveryHours;

  const { data, error } = await sb
    .from("orders")
    .insert({
      order_number: orderNumber(),
      user_id: input.userId,
      project_id: input.projectId,
      package_id: input.packageId,
      coupon_id: couponId,
      status: "awaiting_payment",
      subtotal_cents: subtotal,
      discount_cents: discount,
      tax_cents: tax,
      total_cents: total,
      currency: pkg.currency,
      delivery_speed: input.deliverySpeed ?? "standard",
      estimated_delivery_at: new Date(Date.now() + deliveryHours * 3600 * 1000).toISOString(),
      email: input.email,
      phone: input.phone,
      revision_credits_remaining: pkg.revisionCredits,
      share_token: nanoid(32),
      idempotency_key: input.idempotencyKey,
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create order");

  await sb
    .from("projects")
    .update({ status: "awaiting_payment", package_id: input.packageId })
    .eq("id", input.projectId);

  return attachOrder(mapOrder(data));
}

export async function getOrder(orderId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("orders").select("*").eq("id", orderId).maybeSingle();
  return data ? attachOrder(mapOrder(data)) : null;
}

export async function getOrderByNumber(orderNumberValue: string, email: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("orders")
    .select("*")
    .eq("order_number", orderNumberValue)
    .ilike("email", email)
    .maybeSingle();
  return data ? attachOrder(mapOrder(data)) : null;
}

export async function getOrderByShareToken(token: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("orders").select("*").eq("share_token", token).maybeSingle();
  return data ? attachOrder(mapOrder(data)) : null;
}

export async function listUserOrders(userId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return Promise.all((data ?? []).map((r) => attachOrder(mapOrder(r))));
}

export async function listAllOrders() {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("orders").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  return Promise.all((data ?? []).map((r) => attachOrder(mapOrder(r))));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, patch: Partial<Order> = {}) {
  const sb = getSupabaseAdmin();
  const row: Record<string, unknown> = { status };
  if (patch.stripeCheckoutSessionId != null) row.stripe_checkout_session_id = patch.stripeCheckoutSessionId;
  if (patch.creativeBrief != null) row.creative_brief = patch.creativeBrief;
  if (patch.failedReason != null) row.failed_reason = patch.failedReason;
  if (status === "ready") row.ready_at = new Date().toISOString();
  if (status === "completed") row.completed_at = new Date().toISOString();
  const { data, error } = await sb.from("orders").update(row).eq("id", orderId).select().single();
  if (error || !data) return null;
  return attachOrder(mapOrder(data));
}

export async function updateOrderPrivacy(
  orderId: string,
  privacyMode: PrivacyMode,
  giftRevealEnabled?: boolean,
  passwordHash?: string | null,
) {
  const sb = getSupabaseAdmin();
  const row: Record<string, unknown> = { privacy_mode: privacyMode };
  if (typeof giftRevealEnabled === "boolean") row.gift_reveal_enabled = giftRevealEnabled;
  if (passwordHash !== undefined) row.password_hash = passwordHash;
  const { data, error } = await sb.from("orders").update(row).eq("id", orderId).select().single();
  if (error || !data) return null;
  return attachOrder(mapOrder(data));
}

export async function enqueueJob(orderId: string, jobType: JobType, input: Record<string, unknown> = {}) {
  const sb = getSupabaseAdmin();
  const idempotencyKey = `${orderId}:${jobType}`;
  const { data: existing } = await sb
    .from("generation_jobs")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (existing && existing.status !== "dead_letter" && existing.status !== "failed") {
    return mapJob(existing);
  }
  const { data, error } = await sb
    .from("generation_jobs")
    .insert({
      order_id: orderId,
      job_type: jobType,
      status: "queued",
      idempotency_key: existing ? `${idempotencyKey}:${Date.now()}` : idempotencyKey,
      input,
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to enqueue job");
  return mapJob(data);
}

export async function getJob(jobId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("generation_jobs").select("*").eq("id", jobId).maybeSingle();
  return data ? mapJob(data) : null;
}

export async function listJobs(status?: GenerationJob["status"]) {
  const sb = getSupabaseAdmin();
  let q = sb.from("generation_jobs").select("*").order("created_at");
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return (data ?? []).map(mapJob);
}

export async function listOrderJobs(orderId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("generation_jobs")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  return (data ?? []).map(mapJob);
}

export async function updateJob(jobId: string, patch: Partial<GenerationJob>) {
  const sb = getSupabaseAdmin();
  const row: Record<string, unknown> = {};
  if (patch.status != null) row.status = patch.status;
  if (patch.progress != null) row.progress = patch.progress;
  if (patch.attempt != null) row.attempt = patch.attempt;
  if (patch.error != null) row.error = patch.error;
  if (patch.provider != null) row.provider = patch.provider;
  const { data, error } = await sb.from("generation_jobs").update(row).eq("id", jobId).select().single();
  if (error || !data) return null;
  return mapJob(data);
}

export async function saveSongVersion(version: Omit<SongVersion, "id" | "createdAt"> & { id?: string }) {
  const sb = getSupabaseAdmin();
  await sb.from("song_versions").update({ is_current: false }).eq("order_id", version.orderId);

  const { data: existing } = await sb
    .from("song_versions")
    .select("*")
    .eq("order_id", version.orderId)
    .eq("version_number", version.versionNumber)
    .maybeSingle();

  const payload = {
    order_id: version.orderId,
    version_number: version.versionNumber,
    title: version.title,
    lyrics: version.lyrics,
    timed_lyrics: version.timedLyrics,
    genre: version.genre,
    mood: version.mood,
    vocal_type: version.vocalType,
    language: version.language,
    duration_seconds: version.durationSeconds,
    is_current: true,
  };

  const { data, error } = existing
    ? await sb.from("song_versions").update(payload).eq("id", existing.id).select().single()
    : await sb.from("song_versions").insert(payload).select().single();
  if (error || !data) throw new Error(error?.message ?? "Failed to save version");

  const versionId = data.id;
  const persistAsset = async (kind: string, url: string | null | undefined, mimeType: string) => {
    // Skip local mock/sample paths; store both external provider URLs and storage paths.
    if (!url || url.startsWith("/")) return;
    const { data: existingAsset } = await sb
      .from("generated_assets")
      .select("id")
      .eq("song_version_id", versionId)
      .eq("kind", kind)
      .maybeSingle();
    const assetPayload = {
      order_id: version.orderId,
      song_version_id: versionId,
      kind,
      storage_path: url,
      mime_type: mimeType,
      size_bytes: 0,
      metadata: {},
      is_primary: true,
    };
    if (existingAsset) {
      await sb.from("generated_assets").update(assetPayload).eq("id", existingAsset.id);
    } else {
      await sb.from("generated_assets").insert(assetPayload);
    }
  };
  await persistAsset("audio", version.audioUrl, "audio/mpeg");
  await persistAsset("cover", version.coverUrl, "image/jpeg");
  await persistAsset("music_video", version.videoUrl, "video/mp4");

  return mapSongVersion(data, {
    audioUrl: version.audioUrl,
    coverUrl: version.coverUrl,
    videoUrl: version.videoUrl,
  });
}

export async function listSongVersions(orderId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("song_versions")
    .select("*")
    .eq("order_id", orderId)
    .order("version_number", { ascending: false });
  const rows = data ?? [];
  if (rows.length === 0) return [];
  const { data: assets } = await sb.from("generated_assets").select("*").eq("order_id", orderId);
  return Promise.all(
    rows.map(async (r) => {
      const forVersion = (assets ?? []).filter((a) => a.song_version_id === r.id);
      const audio = forVersion.find((a) => a.kind === "audio");
      const cover = forVersion.find((a) => a.kind === "cover");
      const video = forVersion.find((a) => a.kind === "music_video" || a.kind === "lyric_video");
      return mapSongVersion(r, {
        audioUrl: audio ? await getSignedAssetUrl(audio.storage_path) : null,
        coverUrl: cover ? await getSignedAssetUrl(cover.storage_path) : null,
        videoUrl: video ? await getSignedAssetUrl(video.storage_path) : null,
      });
    })
  );
}

export async function createRevision(input: Omit<RevisionRequest, "id" | "createdAt" | "status">) {
  const sb = getSupabaseAdmin();
  const { data: order } = await sb.from("orders").select("revision_credits_remaining").eq("id", input.orderId).single();
  if (!order || order.revision_credits_remaining <= 0) throw new Error("No revision credits remaining");

  await sb
    .from("orders")
    .update({
      revision_credits_remaining: order.revision_credits_remaining - 1,
      status: "revision_requested",
    })
    .eq("id", input.orderId);

  const { data, error } = await sb
    .from("revision_requests")
    .insert({
      order_id: input.orderId,
      user_id: input.userId,
      categories: input.categories,
      notes: input.notes,
      timestamps: input.timestamps,
      status: "requested",
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create revision");
  return {
    id: data.id,
    orderId: data.order_id,
    userId: data.user_id,
    status: data.status,
    categories: data.categories,
    notes: data.notes,
    timestamps: data.timestamps ?? [],
    createdAt: data.created_at,
  };
}

export async function listRevisions(orderId?: string) {
  const sb = getSupabaseAdmin();
  let q = sb.from("revision_requests").select("*").order("created_at", { ascending: false });
  if (orderId) q = q.eq("order_id", orderId);
  const { data } = await q;
  return (data ?? []).map((r) => ({
    id: r.id,
    orderId: r.order_id,
    userId: r.user_id,
    status: r.status,
    categories: r.categories,
    notes: r.notes,
    timestamps: r.timestamps ?? [],
    createdAt: r.created_at,
  }));
}

export async function createNotification(
  input: Omit<import("@/types").Notification, "id" | "createdAt" | "readAt">,
) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("notifications")
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create notification");
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    title: data.title,
    body: data.body,
    href: data.href,
    readAt: null,
    createdAt: data.created_at,
  };
}

export async function listNotifications(userId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((n) => ({
    id: n.id,
    userId: n.user_id,
    type: n.type,
    title: n.title,
    body: n.body,
    href: n.href,
    readAt: n.read_at,
    createdAt: n.created_at,
  }));
}

export async function createTicket(input: Omit<SupportTicket, "id" | "createdAt" | "status">) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("support_tickets")
    .insert({
      user_id: input.userId,
      order_id: input.orderId,
      email: input.email,
      subject: input.subject,
      body: input.body,
      status: "open",
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create ticket");
  return mapTicket(data);
}

export async function listTickets() {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("support_tickets").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapTicket);
}

export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  ids: Partial<Pick<AnalyticsEvent, "sessionId" | "userId" | "projectId" | "orderId">> = {},
) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("analytics_events")
    .insert({
      event_name: eventName,
      session_id: ids.sessionId,
      user_id: ids.userId,
      project_id: ids.projectId,
      order_id: ids.orderId,
      properties,
    })
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    eventName: data.event_name,
    sessionId: data.session_id,
    userId: data.user_id,
    projectId: data.project_id,
    orderId: data.order_id,
    properties: data.properties,
    createdAt: data.created_at,
  };
}

export async function getAnalyticsSummary() {
  const sb = getSupabaseAdmin();
  const [orders, jobs, tickets, revisions, events] = await Promise.all([
    sb.from("orders").select("total_cents, status"),
    sb.from("generation_jobs").select("status"),
    sb.from("support_tickets").select("status"),
    sb.from("revision_requests").select("status"),
    sb.from("analytics_events").select("event_name"),
  ]);

  const revenue = (orders.data ?? [])
    .filter((o) => !["awaiting_payment", "draft", "refunded", "failed"].includes(o.status))
    .reduce((sum, o) => sum + o.total_cents, 0);

  const counts = (events.data ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.event_name] = (acc[e.event_name] ?? 0) + 1;
    return acc;
  }, {});

  return {
    revenueCents: revenue,
    orderCount: orders.data?.length ?? 0,
    activeJobs: (jobs.data ?? []).filter((j) => j.status === "queued" || j.status === "running").length,
    failedJobs: (jobs.data ?? []).filter((j) => j.status === "failed" || j.status === "dead_letter").length,
    openTickets: (tickets.data ?? []).filter((t) => t.status === "open").length,
    revisionQueue: (revisions.data ?? []).filter((r) => r.status === "requested").length,
    funnel: {
      heroCta: counts["hero_cta_clicked"] ?? 0,
      studioStarted: counts["studio_started"] ?? 0,
      checkoutStarted: counts["checkout_started"] ?? 0,
      purchaseCompleted: counts["purchase_completed"] ?? 0,
    },
    popularOccasions: [],
    popularGenres: [],
  };
}

export async function ensureDemoAdmin() {
  return createOrGetProfile({
    email: "admin@melora.app",
    fullName: "Melora Admin",
    role: "super_admin",
  });
}

export async function exportUserData(userId: string) {
  const [profile, projects, orders] = await Promise.all([
    getProfile(userId),
    listUserProjects(userId),
    listUserOrders(userId),
  ]);
  return { profile, projects, orders, exportedAt: new Date().toISOString() };
}

export async function softDeleteUser(userId: string) {
  const sb = getSupabaseAdmin();
  await sb
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId);
}

export async function verifyOrderSharePassword(orderId: string, password: string) {
  const { verifyPassword } = await import("@/lib/security/password");
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("orders").select("password_hash").eq("id", orderId).maybeSingle();
  if (!data?.password_hash) return false;
  return verifyPassword(password, data.password_hash as string);
}

export { saveStore } from "./store";

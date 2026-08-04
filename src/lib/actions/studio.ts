"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, getGuestToken, setGuestToken, signInWithPassword } from "@/lib/auth/session";
import {
  addMedia,
  claimProject,
  createGuestProject,
  createOrder,
  findCoupon,
  getProject,
  trackEvent,
  updateProjectStep,
  upsertPreferences,
  upsertRecipient,
  upsertStory,
} from "@/lib/db/repository";
import { startGenerationPipeline } from "@/lib/jobs/pipeline";
import { createCheckoutSession } from "@/lib/stripe/client";
import { sendEmail } from "@/lib/email/send";
import {
  checkoutSchema,
  lyricsDirectionSchema,
  occasionSchema,
  recipientSchema,
  storySchema,
  styleSchema,
} from "@/lib/validation/studio";
import { getEnv } from "@/lib/env";

async function assertProjectAccess(projectId: string) {
  const guestToken = await getGuestToken();
  const user = await getCurrentUser();
  const project = await getProject(projectId, guestToken);
  if (!project) throw new Error("Project not found");
  if (project.userId && user?.id !== project.userId && user?.role === "customer") {
    throw new Error("Forbidden");
  }
  return { project, user, guestToken };
}

export async function startStudioAction(formData?: FormData) {
  const locale = String(formData?.get("locale") || "en");
  const project = await createGuestProject(locale);
  if (project.guestToken) await setGuestToken(project.guestToken);
  await trackEvent("studio_started", {}, { projectId: project.id, sessionId: project.guestToken });
  redirect(`/studio/${project.id}/occasion`);
}

export async function saveOccasionAction(projectId: string, formData: FormData) {
  await assertProjectAccess(projectId);
  const parsed = occasionSchema.parse({ occasion: formData.get("occasion") });
  await updateProjectStep(projectId, 2, { occasion: parsed.occasion });
  await trackEvent("studio_step_completed", { step: 1 }, { projectId });
  redirect(`/studio/${projectId}/recipient`);
}

export async function saveRecipientAction(projectId: string, formData: FormData) {
  await assertProjectAccess(projectId);
  const parsed = recipientSchema.parse({
    name: formData.get("name"),
    pronunciation: formData.get("pronunciation") || null,
    relationship: formData.get("relationship") || null,
    pronouns: formData.get("pronouns") || null,
    nickname: formData.get("nickname") || null,
    fromName: formData.get("fromName") || null,
  });
  await upsertRecipient(projectId, {
    name: parsed.name,
    pronunciation: parsed.pronunciation ?? null,
    relationship: parsed.relationship ?? null,
    pronouns: parsed.pronouns ?? null,
    nickname: parsed.nickname ?? null,
    fromName: parsed.fromName ?? null,
  });
  await updateProjectStep(projectId, 3);
  await trackEvent("studio_step_completed", { step: 2 }, { projectId });
  redirect(`/studio/${projectId}/story`);
}

export async function saveStoryAction(projectId: string, formData: FormData) {
  await assertProjectAccess(projectId);
  const parsed = storySchema.parse({
    howTheyMet: formData.get("howTheyMet") || null,
    favoriteMemory: formData.get("favoriteMemory"),
    importantDates: formData.get("importantDates") || null,
    meaningfulPlaces: formData.get("meaningfulPlaces") || null,
    insideJokes: formData.get("insideJokes") || null,
    challengesOvercome: formData.get("challengesOvercome") || null,
    whatMakesSpecial: formData.get("whatMakesSpecial"),
    personalMessage: formData.get("personalMessage") || null,
  });
  await upsertStory(projectId, {
    howTheyMet: parsed.howTheyMet ?? null,
    favoriteMemory: parsed.favoriteMemory,
    importantDates: parsed.importantDates ?? null,
    meaningfulPlaces: parsed.meaningfulPlaces ?? null,
    insideJokes: parsed.insideJokes ?? null,
    challengesOvercome: parsed.challengesOvercome ?? null,
    whatMakesSpecial: parsed.whatMakesSpecial,
    personalMessage: parsed.personalMessage ?? null,
  });
  await updateProjectStep(projectId, 4);
  await trackEvent("studio_step_completed", { step: 3 }, { projectId });
  redirect(`/studio/${projectId}/style`);
}

export async function saveStyleAction(projectId: string, formData: FormData) {
  await assertProjectAccess(projectId);
  const instruments = String(formData.get("instruments") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = styleSchema.parse({
    genre: formData.get("genre"),
    customStyle: formData.get("customStyle") || null,
    mood: formData.get("mood"),
    energy: formData.get("energy") || null,
    tempo: formData.get("tempo") || null,
    vocalType: formData.get("vocalType"),
    duetPreference: formData.get("duetPreference") || null,
    language: formData.get("language") || "en",
    explicitContent: formData.get("explicitContent") === "on",
    instruments,
  });

  const existing = (await getProject(projectId))?.preferences;
  await upsertPreferences(projectId, {
    genre: parsed.genre,
    customStyle: parsed.customStyle ?? null,
    mood: parsed.mood,
    energy: parsed.energy ?? null,
    tempo: parsed.tempo ?? null,
    vocalType: parsed.vocalType,
    duetPreference: parsed.duetPreference ?? null,
    language: parsed.language,
    explicitContent: parsed.explicitContent,
    instruments: parsed.instruments,
    lyricTone: existing?.lyricTone ?? null,
    mustInclude: existing?.mustInclude ?? [],
    mustExclude: existing?.mustExclude ?? [],
    chorusMessage: existing?.chorusMessage ?? null,
    desiredLength: existing?.desiredLength ?? null,
    videoStyle: existing?.videoStyle ?? null,
  });
  await updateProjectStep(projectId, 5);
  await trackEvent("studio_step_completed", { step: 4 }, { projectId });
  redirect(`/studio/${projectId}/lyrics`);
}

export async function saveLyricsAction(projectId: string, formData: FormData) {
  await assertProjectAccess(projectId);
  const mustInclude = String(formData.get("mustInclude") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const mustExclude = String(formData.get("mustExclude") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = lyricsDirectionSchema.parse({
    lyricTone: formData.get("lyricTone"),
    mustInclude,
    mustExclude,
    chorusMessage: formData.get("chorusMessage") || null,
    desiredLength: formData.get("desiredLength") || null,
  });

  const existing = (await getProject(projectId))?.preferences;
  await upsertPreferences(projectId, {
    genre: existing?.genre ?? null,
    customStyle: existing?.customStyle ?? null,
    mood: existing?.mood ?? null,
    energy: existing?.energy ?? null,
    tempo: existing?.tempo ?? null,
    vocalType: existing?.vocalType ?? null,
    duetPreference: existing?.duetPreference ?? null,
    language: existing?.language ?? "en",
    explicitContent: existing?.explicitContent ?? false,
    instruments: existing?.instruments ?? [],
    lyricTone: parsed.lyricTone,
    mustInclude: parsed.mustInclude,
    mustExclude: parsed.mustExclude,
    chorusMessage: parsed.chorusMessage ?? null,
    desiredLength: parsed.desiredLength ?? null,
    videoStyle: existing?.videoStyle ?? null,
  });
  await updateProjectStep(projectId, 6);
  await trackEvent("studio_step_completed", { step: 5 }, { projectId });
  redirect(`/studio/${projectId}/media`);
}

export async function saveMediaAction(projectId: string, formData: FormData) {
  await assertProjectAccess(projectId);
  const consent = formData.get("consentConfirmed") === "on";
  if (!consent) throw new Error("Consent required");

  const videoStyle = String(formData.get("videoStyle") || "") || null;
  const existing = (await getProject(projectId))?.preferences;
  if (existing) {
    await upsertPreferences(projectId, { ...existing, videoStyle });
  }

  const files = formData.getAll("files");
  for (const [index, file] of files.entries()) {
    if (!(file instanceof File) || file.size === 0) continue;
    const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];
    if (!allowed.includes(file.type)) continue;
    if (file.size > 100 * 1024 * 1024) continue;

    // In production, upload to Supabase/S3. Locally we store metadata + object URL placeholders.
    await addMedia(projectId, {
      userId: null,
      kind: file.type.startsWith("video") ? "video_clip" : "portrait",
      storagePath: `local/${projectId}/${file.name}`,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      sortOrder: index,
      consentConfirmed: true,
      url: `/samples/covers/golden-hour.svg`,
    });
  }

  await updateProjectStep(projectId, 7);
  await trackEvent("studio_step_completed", { step: 6 }, { projectId });
  redirect(`/studio/${projectId}/review`);
}

export async function confirmReviewAction(projectId: string, formData: FormData) {
  await assertProjectAccess(projectId);
  if (formData.get("accuracyConfirmed") !== "on" || formData.get("rightsConfirmed") !== "on") {
    throw new Error("Please confirm accuracy and content rights");
  }
  await updateProjectStep(projectId, 8);
  await trackEvent("studio_step_completed", { step: 7 }, { projectId });
  redirect(`/studio/${projectId}/checkout`);
}

export async function applyCouponAction(code: string) {
  const coupon = await findCoupon(code);
  if (!coupon) return { ok: false as const, message: "Coupon not found or expired" };
  return {
    ok: true as const,
    coupon: {
      code: coupon.code,
      percentOff: coupon.percentOff,
      amountOffCents: coupon.amountOffCents,
    },
  };
}

export async function checkoutAction(projectId: string, formData: FormData) {
  const { user } = await assertProjectAccess(projectId);
  const parsed = checkoutSchema.parse({
    packageId: formData.get("packageId"),
    addOnIds: formData.getAll("addOnIds"),
    deliverySpeed: formData.get("deliverySpeed") || "standard",
    couponCode: formData.get("couponCode") || null,
    email: formData.get("email"),
    phone: formData.get("phone") || null,
    createAccount: formData.get("createAccount") === "on",
    password: formData.get("password") || null,
    termsAccepted: formData.get("termsAccepted") === "on" ? true : false,
    idempotencyKey: formData.get("idempotencyKey"),
  });

  let userId = user?.id ?? null;
  if (!userId && parsed.createAccount) {
    const profile = await signInWithPassword(
      parsed.email,
      parsed.password || "changeme-temp",
      undefined,
    );
    userId = profile.id;
    await claimProject(projectId, userId);
  } else if (userId) {
    await claimProject(projectId, userId);
  }

  const order = await createOrder({
    projectId,
    packageId: parsed.packageId,
    email: parsed.email,
    phone: parsed.phone,
    userId,
    couponCode: parsed.couponCode,
    addOnIds: parsed.addOnIds,
    deliverySpeed: parsed.deliverySpeed,
    idempotencyKey: parsed.idempotencyKey,
  });

  await trackEvent(
    "checkout_started",
    { packageId: parsed.packageId, total: order.totalCents },
    { projectId, orderId: order.id, userId },
  );

  const env = getEnv();
  const session = await createCheckoutSession(
    order,
    `${env.NEXT_PUBLIC_APP_URL}/studio/${projectId}/success?orderId=${order.id}`,
    `${env.NEXT_PUBLIC_APP_URL}/studio/${projectId}/checkout`,
  );

  // Persist checkout session id
  const { mutateStore } = await import("@/lib/db/store");
  await mutateStore((store) => {
    const o = store.orders.find((x) => x.id === order.id);
    if (o) o.stripeCheckoutSessionId = session.id;
  });

  if (session.url) redirect(session.url);
  throw new Error("Unable to start checkout");
}

export async function completeMockPaymentAction(orderId: string) {
  const { updateOrderStatus, getOrder, trackEvent } = await import("@/lib/db/repository");
  const order = await getOrder(orderId);
  if (!order) throw new Error("Order not found");

  await updateOrderStatus(orderId, "payment_confirmed");
  await sendEmail({
    to: order.email,
    template: "order-confirmation",
    data: {
      orderNumber: order.orderNumber,
      estimatedDelivery: order.estimatedDeliveryAt || "soon",
    },
  });
  await trackEvent("purchase_completed", { total: order.totalCents }, { orderId });
  await startGenerationPipeline(orderId);
  revalidatePath(`/dashboard`);
  return { ok: true };
}

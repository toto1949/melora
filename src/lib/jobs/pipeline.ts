import {
  enqueueJob,
  claimJob,
  getOrder,
  listOrderJobs,
  saveSongVersion,
  updateJob,
  updateOrderStatus,
  createNotification,
} from "@/lib/db/repository";
import { sendEmail } from "@/lib/email/send";
import {
  getCoverArtProvider,
  getLyricsProvider,
  getMusicProvider,
  getVideoProvider,
  type CreativeBrief,
} from "@/lib/providers";
import type { GenerationJob, Order, Project } from "@/types";
import { getEnv } from "@/lib/env";
import { logEvent } from "@/lib/observability/logger";

const PIPELINE: Array<GenerationJob["jobType"]> = [
  "creative_brief",
  "lyrics",
  "music",
  "cover_art",
  "lyric_video",
  "photo_video",
  "quality_check",
  "notify",
];

function buildBrief(order: Order): CreativeBrief {
  const project = order.project as Project;
  const story = project?.story;
  const prefs = project?.preferences;
  const recipient = project?.recipient;

  const highlights = [
    story?.favoriteMemory,
    story?.whatMakesSpecial,
    story?.howTheyMet,
    story?.insideJokes,
    story?.challengesOvercome,
  ].filter(Boolean) as string[];

  return {
    recipientName: recipient?.name || "Someone special",
    occasion: project?.occasion || "just-because",
    relationship: recipient?.relationship || null,
    storyHighlights: highlights,
    genre: prefs?.genre || "pop",
    mood: prefs?.mood || "Emotional",
    vocalType: prefs?.vocalType || "Soft female",
    language: prefs?.language || "en",
    lyricTone: prefs?.lyricTone || "Emotional",
    mustInclude: prefs?.mustInclude || [],
    mustExclude: prefs?.mustExclude || [],
    chorusMessage: prefs?.chorusMessage || null,
    personalMessage: story?.personalMessage || null,
  };
}

async function withRetry<T>(
  job: GenerationJob,
  run: () => Promise<T>,
): Promise<T> {
  try {
    const result = await run();
    await updateJob(job.id, {
      status: "succeeded",
      progress: 100,
      nextRetryAt: null,
      finishedAt: new Date().toISOString(),
    });
    logEvent("info", "generation_job_succeeded", {
      jobId: job.id,
      orderId: job.orderId,
      jobType: job.jobType,
      attempt: job.attempt,
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const failed = job.attempt >= job.maxAttempts;
    const backoffMs = Math.min(15 * 60_000, 2 ** job.attempt * 15_000);
    await updateJob(job.id, {
      status: failed ? "dead_letter" : "failed",
      error: message,
      nextRetryAt: failed ? null : new Date(Date.now() + backoffMs).toISOString(),
      finishedAt: failed ? new Date().toISOString() : null,
    });
    if (failed && job.jobType !== "notify") {
      await updateOrderStatus(job.orderId, "failed", {
        failedReason: `${job.jobType}: ${message}`,
      });
    }
    logEvent(failed ? "error" : "warn", "generation_job_failed", {
      jobId: job.id,
      orderId: job.orderId,
      jobType: job.jobType,
      attempt: job.attempt,
      maxAttempts: job.maxAttempts,
      retryInMs: failed ? null : backoffMs,
      error: message,
    });
    throw error;
  }
}

export async function startGenerationPipeline(orderId: string) {
  for (const jobType of PIPELINE) {
    await enqueueJob(orderId, jobType);
  }
  await updateOrderStatus(orderId, "payment_confirmed");
  if (getEnv().USE_MOCK_PROVIDERS) return processQueuedJobs(orderId);

  try {
    const env = getEnv();
    const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/jobs/process`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-job-worker-secret": env.JOB_WORKER_SECRET,
      },
      body: JSON.stringify({ orderId }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Worker scheduling failed (${response.status})`);
    logEvent("info", "generation_pipeline_scheduled", { orderId });
    return { scheduled: true };
  } catch (error) {
    // Jobs are already durable in Postgres; Supabase Cron will pick them up.
    logEvent("error", "generation_pipeline_schedule_failed", {
      orderId,
      error: error instanceof Error ? error.message : "Unknown scheduling error",
    });
    return { scheduled: false };
  }
}

const STALE_RUNNING_MS = 15 * 60 * 1000;
const WORKER_BUDGET_MS = 230_000;
const MAX_JOBS_PER_RUN = 10;

export async function processQueuedJobs(orderId?: string) {
  const { listRunnableJobs } = await import("@/lib/db/repository");
  const allJobs = orderId ? await listOrderJobs(orderId) : await listRunnableJobs();
  const startedAt = Date.now();
  let processed = 0;

  // Group per order and process each order's jobs strictly in pipeline
  // stage order; a stage failure stops that order's run so later stages
  // (e.g. notify) never execute before their prerequisites succeed.
  const byOrder = new Map<string, typeof allJobs>();
  for (const job of allJobs) {
    const group = byOrder.get(job.orderId) ?? [];
    group.push(job);
    byOrder.set(job.orderId, group);
  }

  const results = [];
  orderGroups: for (const [, group] of byOrder) {
    group.sort((a, b) => PIPELINE.indexOf(a.jobType) - PIPELINE.indexOf(b.jobType));
    for (const job of group) {
      if (processed >= MAX_JOBS_PER_RUN || Date.now() - startedAt >= WORKER_BUDGET_MS) {
        logEvent("info", "generation_worker_budget_reached", {
          processed,
          elapsedMs: Date.now() - startedAt,
        });
        break orderGroups;
      }
      if (job.status === "succeeded") continue;
      // Requires manual retry from the admin panel.
      if (job.status === "dead_letter" || job.status === "cancelled") break;
      if (
        job.status === "failed" &&
        job.nextRetryAt &&
        new Date(job.nextRetryAt).getTime() > Date.now()
      ) {
        break;
      }
      if (job.status === "running") {
        const age = Date.now() - new Date(job.updatedAt).getTime();
        // Another worker is likely on it; only reclaim if it looks stale.
        if (age < STALE_RUNNING_MS) break;
      }
      try {
        processed += 1;
        const result = await processJob(job.id);
        results.push(result);
        if ("skipped" in result && result.skipped === "not-claimed") break;
      } catch (error) {
        const message = error instanceof Error ? error.message : "failed";
        results.push({ jobId: job.id, error: message });
        logEvent("error", "generation_worker_job_error", {
          jobId: job.id,
          orderId: job.orderId,
          jobType: job.jobType,
          error: message,
        });
        break;
      }
    }
  }
  return results;
}

export async function processJob(jobId: string) {
  const job = await claimJob(jobId);
  if (!job) return { jobId, skipped: "not-claimed" as const };

  logEvent("info", "generation_job_started", {
    jobId: job.id,
    orderId: job.orderId,
    jobType: job.jobType,
    attempt: job.attempt,
  });

  const order = await getOrder(job.orderId);
  if (!order) {
    await updateJob(job.id, {
      status: "dead_letter",
      error: "Order not found",
      finishedAt: new Date().toISOString(),
    });
    throw new Error("Order not found");
  }

  const packageIncludesVideo = order.package?.includesVideo;
  const packageIncludesLyricVideo = order.package?.includesLyricVideo;

  switch (job.jobType) {
    case "creative_brief": {
      const brief = await withRetry(job, async () => {
        await updateJob(job.id, { progress: 40, provider: "internal" });
        const built = buildBrief(order);
        await updateOrderStatus(order.id, "payment_confirmed", {
          creativeBrief: built as unknown as Record<string, unknown>,
        });
        await updateJob(job.id, { progress: 80 });
        return built;
      });
      return { jobType: job.jobType, brief };
    }
    case "lyrics": {
      await updateOrderStatus(order.id, "writing_lyrics");
      const brief = (order.creativeBrief as unknown as CreativeBrief) || buildBrief(order);
      const lyrics = await withRetry(job, async () => {
        const provider = getLyricsProvider();
        await updateJob(job.id, { progress: 30, provider: provider.name });
        const result = await provider.generateLyrics(brief);
        await updateJob(job.id, { progress: 80 });
        const versions = (await import("@/lib/db/repository")).listSongVersions;
        const existing = await versions(order.id);
        await saveSongVersion({
          orderId: order.id,
          versionNumber: existing.length + 1,
          title: result.title,
          lyrics: result.lyrics,
          timedLyrics: result.timedLyrics,
          audioUrl: null,
          coverUrl: null,
          videoUrl: null,
          genre: brief.genre,
          mood: brief.mood,
          vocalType: brief.vocalType,
          language: brief.language,
          durationSeconds: null,
          isCurrent: true,
        });
        return result;
      });
      return { jobType: job.jobType, lyrics };
    }
    case "music": {
      await updateOrderStatus(order.id, "creating_music");
      const brief = (order.creativeBrief as unknown as CreativeBrief) || buildBrief(order);
      const current = order.currentVersion;
      const music = await withRetry(job, async () => {
        if (!current) throw new Error("Lyrics version is missing before music generation");
        const provider = getMusicProvider();
        await updateJob(job.id, { progress: 25, provider: provider.name });
        const result = await provider.generateMusic({
          brief,
          lyrics: current?.lyrics || "",
          title: current?.title || "Untitled",
          idempotencyKey: job.idempotencyKey,
          onProviderJobId: async (providerJobId) => {
            await updateJob(job.id, { providerJobId });
          },
        });
        if (!isExternalAssetUrl(result.audioUrl)) {
          throw new Error("Music provider returned an invalid audio URL");
        }
        await updateJob(job.id, { providerJobId: result.providerJobId ?? job.providerJobId });
        await updateJob(job.id, { progress: 75 });
        await saveSongVersion({
          ...current,
          versionNumber: current.versionNumber,
          audioUrl: result.audioUrl,
          durationSeconds: result.durationSeconds,
          coverUrl: result.coverUrl ?? current.coverUrl,
          isCurrent: true,
        });
        return result;
      });
      return { jobType: job.jobType, music };
    }
    case "cover_art": {
      const current = (await getOrder(order.id))?.currentVersion;
      // The music provider may deliver real cover art (e.g. Suno) — keep it.
      if (current?.coverUrl && !current.coverUrl.startsWith("/samples/")) {
        await updateJob(job.id, {
          status: "succeeded",
          progress: 100,
          provider: "music-provider",
          finishedAt: new Date().toISOString(),
        });
        return { jobType: job.jobType, skipped: true };
      }
      const brief = (order.creativeBrief as unknown as CreativeBrief) || buildBrief(order);
      const cover = await withRetry(job, async () => {
        if (!current) throw new Error("Song version is missing before cover generation");
        const provider = getCoverArtProvider();
        await updateJob(job.id, { progress: 40, provider: provider.name });
        const result = await provider.generateCover({
          title: current?.title || "Your Personalized Song",
          occasion: brief.occasion,
          genre: brief.genre,
          mood: brief.mood,
        });
        await saveSongVersion({
          ...current,
          versionNumber: current.versionNumber,
          coverUrl: result.imageUrl,
          isCurrent: true,
        });
        return result;
      });
      return { jobType: job.jobType, cover };
    }
    case "lyric_video": {
      if (
        !getEnv().VIDEO_FEATURE_ENABLED ||
        !packageIncludesLyricVideo ||
        packageIncludesVideo
      ) {
        await updateJob(job.id, {
          status: "succeeded",
          progress: 100,
          provider: !getEnv().VIDEO_FEATURE_ENABLED
            ? "feature-disabled"
            : packageIncludesVideo
              ? "superseded-by-photo-video"
              : "package-excluded",
          finishedAt: new Date().toISOString(),
        });
        return { jobType: job.jobType, skipped: true };
      }
      await updateOrderStatus(order.id, "creating_video");
      const current = (await getOrder(order.id))?.currentVersion;
      const video = await withRetry(job, async () => {
        if (!current?.audioUrl) throw new Error("Audio asset is missing before video generation");
        const provider = getVideoProvider();
        await updateJob(job.id, { progress: 35, provider: provider.name });
        const result = await provider.generateVideo({
          title: current?.title || "Your Personalized Song",
          audioUrl: current.audioUrl,
          style: "Minimal lyric video",
          photoUrls: [],
          lyrics: current?.lyrics,
        });
        if (!isExternalAssetUrl(result.videoUrl)) {
          throw new Error("Video provider returned an invalid video URL");
        }
        await saveSongVersion({
          ...current,
          versionNumber: current.versionNumber,
          videoUrl: result.videoUrl,
          isCurrent: true,
        });
        return result;
      });
      return { jobType: job.jobType, video };
    }
    case "photo_video": {
      if (!getEnv().VIDEO_FEATURE_ENABLED || !packageIncludesVideo) {
        await updateJob(job.id, {
          status: "succeeded",
          progress: 100,
          provider: getEnv().VIDEO_FEATURE_ENABLED ? "package-excluded" : "feature-disabled",
          finishedAt: new Date().toISOString(),
        });
        return { jobType: job.jobType, skipped: true };
      }
      await updateOrderStatus(order.id, "creating_video");
      const current = (await getOrder(order.id))?.currentVersion;
      const photos =
        order.project?.media
          ?.filter((media) => media.malwareScanStatus === "clean")
          .map((media) => media.url || media.storagePath) || [];
      const style = order.project?.preferences?.videoStyle || "Cinematic";
      const video = await withRetry(job, async () => {
        if (!current?.audioUrl) throw new Error("Audio asset is missing before video generation");
        const provider = getVideoProvider();
        await updateJob(job.id, { progress: 35, provider: provider.name });
        const result = await provider.generateVideo({
          title: current?.title || "Your Personalized Song",
          audioUrl: current.audioUrl,
          style,
          photoUrls: photos,
          lyrics: current?.lyrics,
        });
        if (!isExternalAssetUrl(result.videoUrl)) {
          throw new Error("Video provider returned an invalid video URL");
        }
        await saveSongVersion({
          ...current,
          versionNumber: current.versionNumber,
          videoUrl: result.videoUrl,
          isCurrent: true,
        });
        return result;
      });
      return { jobType: job.jobType, video };
    }
    case "quality_check": {
      await updateOrderStatus(order.id, "quality_review");
      const current = (await getOrder(order.id))?.currentVersion;
      await withRetry(job, async () => {
        await updateJob(job.id, { progress: 50, provider: "internal-qa" });
        if (!current?.lyrics || current.lyrics.length < 40) {
          throw new Error("Lyrics quality check failed");
        }
        if (!current.audioUrl) throw new Error("Audio quality check failed: asset missing");
        if (
          getEnv().VIDEO_FEATURE_ENABLED &&
          (packageIncludesVideo || packageIncludesLyricVideo) &&
          !current.videoUrl
        ) {
          throw new Error("Video quality check failed: asset missing");
        }
        await updateJob(job.id, { progress: 90 });
        return true;
      });
      await updateOrderStatus(order.id, "ready");
      return { jobType: job.jobType, ok: true };
    }
    case "notify": {
      const fresh = await getOrder(order.id);
      await withRetry(job, async () => {
        await updateJob(job.id, { progress: 40, provider: "resend-or-console" });
        await sendEmail({
          to: order.email,
          template: "song-ready",
          data: {
            orderNumber: order.orderNumber,
            title: fresh?.currentVersion?.title || "Your personalized song",
            listenUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/listen/${order.shareToken}`,
          },
        });
        if (order.userId) {
          await createNotification({
            userId: order.userId,
            type: "song_ready",
            title: "Your song is ready",
            body: "Your personalized song from Memories to Melody is ready to listen and share.",
            href: `/listen/${order.shareToken}`,
          });
        }
        await updateJob(job.id, { progress: 90 });
        return true;
      });
      await updateOrderStatus(order.id, "completed");
      return { jobType: job.jobType, notified: true };
    }
    default:
      await updateJob(job.id, {
        status: "succeeded",
        progress: 100,
        finishedAt: new Date().toISOString(),
      });
      return { jobType: job.jobType };
  }
}

export async function retryJob(jobId: string) {
  await updateJob(jobId, {
    status: "queued",
    error: null,
    progress: 0,
    attempt: 0,
    nextRetryAt: null,
    startedAt: null,
    finishedAt: null,
  });
  return processJob(jobId);
}

function isExternalAssetUrl(value: string) {
  if (getEnv().USE_MOCK_PROVIDERS && value.startsWith("/samples/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

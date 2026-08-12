import {
  enqueueJob,
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
import { sleep } from "@/lib/utils";
import type { GenerationJob, Order, Project } from "@/types";

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
  const attempt = job.attempt + 1;
  await updateJob(job.id, {
    status: "running",
    attempt,
    progress: Math.max(job.progress, 5),
    error: null,
  });

  try {
    const result = await run();
    await updateJob(job.id, { status: "succeeded", progress: 100 });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const failed = attempt >= job.maxAttempts;
    const backoffMs = Math.min(60_000, 2 ** attempt * 500);
    await updateJob(job.id, {
      status: failed ? "dead_letter" : "failed",
      error: message,
      progress: job.progress,
    });
    if (!failed) {
      await sleep(backoffMs);
      throw error;
    }
    throw error;
  }
}

export async function startGenerationPipeline(orderId: string) {
  for (const jobType of PIPELINE) {
    await enqueueJob(orderId, jobType);
  }
  await updateOrderStatus(orderId, "payment_confirmed");
  return processQueuedJobs(orderId);
}

/**
 * Fire a fresh /api/jobs/process invocation so retriable failures (e.g. a
 * music generation that outlived this function's time budget) get retried
 * with a full time window instead of waiting for the daily cron.
 */
async function triggerRetryRun(orderId?: string) {
  const { getEnv } = await import("@/lib/env");
  const base = getEnv().NEXT_PUBLIC_APP_URL;
  const secret = process.env.JOB_WORKER_SECRET;
  if (!base || !secret) return;
  try {
    await fetch(`${base}/api/jobs/process`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-job-worker-secret": secret },
      body: JSON.stringify(orderId ? { orderId } : {}),
    });
  } catch (error) {
    console.error("retry trigger failed", error);
  }
}

const STALE_RUNNING_MS = 15 * 60 * 1000;

export async function processQueuedJobs(orderId?: string) {
  const { listJobs } = await import("@/lib/db/repository");
  const allJobs = orderId ? await listOrderJobs(orderId) : await listJobs();

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
  let hasRetriableFailure = false;
  for (const [, group] of byOrder) {
    group.sort((a, b) => PIPELINE.indexOf(a.jobType) - PIPELINE.indexOf(b.jobType));
    for (const job of group) {
      if (job.status === "succeeded") continue;
      // Requires manual retry from the admin panel.
      if (job.status === "dead_letter") break;
      if (job.status === "running") {
        const age = Date.now() - new Date(job.updatedAt).getTime();
        // Another worker is likely on it; only reclaim if it looks stale.
        if (age < STALE_RUNNING_MS) break;
      }
      try {
        results.push(await processJob(job.id));
      } catch (error) {
        results.push({ jobId: job.id, error: error instanceof Error ? error.message : "failed" });
        if (job.attempt + 1 < job.maxAttempts) hasRetriableFailure = true;
        break;
      }
    }
  }

  if (hasRetriableFailure) {
    const { after } = await import("next/server");
    after(() => triggerRetryRun(orderId));
  }
  return results;
}

export async function processJob(jobId: string) {
  const { getJob } = await import("@/lib/db/repository");
  const job = await getJob(jobId);
  if (!job) throw new Error("Job not found");

  const order = await getOrder(job.orderId);
  if (!order) throw new Error("Order not found");

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
      const provider = getLyricsProvider();
      const brief = (order.creativeBrief as unknown as CreativeBrief) || buildBrief(order);
      const lyrics = await withRetry(job, async () => {
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
      const provider = getMusicProvider();
      const brief = (order.creativeBrief as unknown as CreativeBrief) || buildBrief(order);
      const current = order.currentVersion;
      const music = await withRetry(job, async () => {
        await updateJob(job.id, { progress: 25, provider: provider.name });
        const result = await provider.generateMusic({
          brief,
          lyrics: current?.lyrics || "",
          title: current?.title || "Untitled",
        });
        await updateJob(job.id, { progress: 75 });
        if (current) {
          await saveSongVersion({
            ...current,
            versionNumber: current.versionNumber,
            audioUrl: result.audioUrl,
            durationSeconds: result.durationSeconds,
            coverUrl: result.coverUrl ?? current.coverUrl,
            isCurrent: true,
          });
        }
        return result;
      });
      return { jobType: job.jobType, music };
    }
    case "cover_art": {
      const current = (await getOrder(order.id))?.currentVersion;
      // The music provider may deliver real cover art (e.g. Suno) — keep it.
      if (current?.coverUrl && !current.coverUrl.startsWith("/samples/")) {
        await updateJob(job.id, { status: "succeeded", progress: 100, provider: "music-provider" });
        return { jobType: job.jobType, skipped: true };
      }
      const provider = getCoverArtProvider();
      const brief = (order.creativeBrief as unknown as CreativeBrief) || buildBrief(order);
      const cover = await withRetry(job, async () => {
        await updateJob(job.id, { progress: 40, provider: provider.name });
        const result = await provider.generateCover({
          title: current?.title || "Melora Song",
          occasion: brief.occasion,
          mood: brief.mood,
        });
        if (current) {
          await saveSongVersion({
            ...current,
            versionNumber: current.versionNumber,
            coverUrl: result.imageUrl,
            isCurrent: true,
          });
        }
        return result;
      });
      return { jobType: job.jobType, cover };
    }
    case "lyric_video": {
      if (!packageIncludesLyricVideo) {
        await updateJob(job.id, { status: "succeeded", progress: 100, provider: "skipped" });
        return { jobType: job.jobType, skipped: true };
      }
      await updateOrderStatus(order.id, "creating_video");
      const provider = getVideoProvider();
      const current = (await getOrder(order.id))?.currentVersion;
      const video = await withRetry(job, async () => {
        await updateJob(job.id, { progress: 35, provider: provider.name });
        const result = await provider.generateVideo({
          title: current?.title || "Melora Song",
          audioUrl: current?.audioUrl || "/samples/audio/placeholder-tone.wav",
          style: "Minimal lyric video",
          photoUrls: [],
          lyrics: current?.lyrics,
        });
        if (current) {
          await saveSongVersion({
            ...current,
            versionNumber: current.versionNumber,
            videoUrl: result.videoUrl,
            isCurrent: true,
          });
        }
        return result;
      });
      return { jobType: job.jobType, video };
    }
    case "photo_video": {
      if (!packageIncludesVideo) {
        await updateJob(job.id, { status: "succeeded", progress: 100, provider: "skipped" });
        return { jobType: job.jobType, skipped: true };
      }
      await updateOrderStatus(order.id, "creating_video");
      const provider = getVideoProvider();
      const current = (await getOrder(order.id))?.currentVersion;
      const photos = order.project?.media?.map((m) => m.url || m.storagePath) || [];
      const style = order.project?.preferences?.videoStyle || "Cinematic";
      const video = await withRetry(job, async () => {
        await updateJob(job.id, { progress: 35, provider: provider.name });
        const result = await provider.generateVideo({
          title: current?.title || "Melora Song",
          audioUrl: current?.audioUrl || "/samples/audio/placeholder-tone.wav",
          style,
          photoUrls: photos,
          lyrics: current?.lyrics,
        });
        if (current) {
          await saveSongVersion({
            ...current,
            versionNumber: current.versionNumber,
            videoUrl: result.videoUrl,
            isCurrent: true,
          });
        }
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
            title: fresh?.currentVersion?.title || "Your Melora song",
            listenUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/listen/${order.shareToken}`,
          },
        });
        if (order.userId) {
          await createNotification({
            userId: order.userId,
            type: "song_ready",
            title: "Your song is ready",
            body: "Your personalized Melora song is ready to listen and share.",
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
      await updateJob(job.id, { status: "succeeded", progress: 100 });
      return { jobType: job.jobType };
  }
}

export async function retryJob(jobId: string) {
  await updateJob(jobId, { status: "queued", error: null, progress: 0 });
  return processJob(jobId);
}

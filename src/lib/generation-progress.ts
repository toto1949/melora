import type { GenerationJob, JobType, OrderStatus } from "@/types";

const JOB_WEIGHTS: Record<JobType, number> = {
  creative_brief: 5,
  lyrics: 15,
  music: 50,
  cover_art: 10,
  lyric_video: 5,
  photo_video: 5,
  quality_check: 5,
  notify: 5,
};

const TERMINAL_STATUSES = new Set<OrderStatus>(["ready", "completed"]);

function representativeJobs(jobs: GenerationJob[]) {
  const selected = new Map<JobType, GenerationJob>();
  for (const job of jobs) {
    const current = selected.get(job.jobType);
    if (!current || job.createdAt > current.createdAt || job.status === "succeeded") {
      selected.set(job.jobType, job);
    }
  }
  return selected;
}

export function calculateOrderProgress(jobs: GenerationJob[], status: OrderStatus) {
  if (TERMINAL_STATUSES.has(status)) return 100;
  if (jobs.length === 0) return status === "awaiting_payment" || status === "draft" ? 0 : 1;

  const selected = representativeJobs(jobs);
  const weightedProgress = Object.entries(JOB_WEIGHTS).reduce((total, [jobType, weight]) => {
    const job = selected.get(jobType as JobType);
    const progress = job?.status === "succeeded" ? 100 : Math.min(100, Math.max(0, job?.progress ?? 0));
    return total + (progress / 100) * weight;
  }, 0);

  return Math.min(99, Math.max(1, Math.round(weightedProgress)));
}

export function getActiveGenerationJob(jobs: GenerationJob[]) {
  const selected = [...representativeJobs(jobs).values()];
  return (
    selected.find((job) => job.status === "running") ??
    selected.find((job) => job.status === "failed" || job.status === "dead_letter") ??
    selected.find((job) => job.status === "queued") ??
    null
  );
}

export function isGenerationTerminal(status: OrderStatus) {
  return TERMINAL_STATUSES.has(status) || status === "failed" || status === "refunded";
}

import { describe, expect, it } from "vitest";
import {
  calculateOrderProgress,
  getActiveGenerationJob,
} from "@/lib/generation-progress";
import type { GenerationJob, JobStatus, JobType } from "@/types";

function job(jobType: JobType, status: JobStatus, progress: number, createdAt = "2026-08-22T12:00:00.000Z"): GenerationJob {
  return {
    id: `${jobType}-${createdAt}`,
    orderId: "order-1",
    jobType,
    status,
    progress,
    attempt: 1,
    maxAttempts: 5,
    idempotencyKey: `order-1:${jobType}`,
    provider: null,
    providerJobId: null,
    error: null,
    nextRetryAt: null,
    startedAt: null,
    finishedAt: null,
    createdAt,
    updatedAt: createdAt,
  };
}

describe("generation progress", () => {
  it("weights music progress so long provider jobs keep moving the overall bar", () => {
    const jobs = [
      job("creative_brief", "succeeded", 100),
      job("lyrics", "succeeded", 100),
      job("music", "running", 50),
    ];

    expect(calculateOrderProgress(jobs, "creating_music")).toBe(45);
    expect(getActiveGenerationJob(jobs)?.jobType).toBe("music");
  });

  it("returns 100 only for a delivered terminal status", () => {
    expect(calculateOrderProgress([], "completed")).toBe(100);
    expect(calculateOrderProgress([job("notify", "running", 90)], "quality_review")).toBeLessThan(100);
  });

  it("prefers a successful retry over an older failed job", () => {
    const jobs = [
      job("lyrics", "failed", 30, "2026-08-22T12:00:00.000Z"),
      job("lyrics", "succeeded", 100, "2026-08-22T12:05:00.000Z"),
    ];

    expect(calculateOrderProgress(jobs, "creating_music")).toBe(15);
  });
});

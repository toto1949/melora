import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ outbox: vi.fn(), jobs: vi.fn(), log: vi.fn(), after: vi.fn() }));
vi.mock("next/server", async (original) => ({ ...await original<typeof import("next/server")>(), after: mocks.after }));
vi.mock("@/lib/env", () => ({ getEnv: () => ({ JOB_WORKER_SECRET: "test-worker" }) }));
vi.mock("@/lib/email/outbox", () => ({ processEmailOutbox: mocks.outbox }));
vi.mock("@/lib/jobs/pipeline", () => ({ processQueuedJobs: mocks.jobs }));
vi.mock("@/lib/observability/logger", () => ({ logEvent: mocks.log }));

import { POST } from "@/app/api/jobs/process/route";
import { retryDatabaseRead } from "@/lib/db/retry-read";

beforeEach(() => { vi.resetAllMocks(); mocks.jobs.mockResolvedValue([]); });
afterEach(() => vi.useRealTimers());

it("continues song processing when the email queue is unavailable", async () => {
  mocks.outbox.mockRejectedValue(new Error("Email outbox unavailable"));
  const response = await POST(new NextRequest("http://localhost/api/jobs/process", {
    method: "POST", headers: { "x-job-worker-secret": "test-worker" }, body: JSON.stringify({ orderId: "order-1" }),
  }));
  expect(response.status).toBe(202);
  await mocks.after.mock.calls[0][0]();
  expect(mocks.jobs).toHaveBeenCalledWith("order-1");
  expect(mocks.log).toHaveBeenCalledWith("error", "email_outbox_processing_failed", expect.any(Object));
});

it("still reports generation failures after an email failure", async () => {
  mocks.outbox.mockRejectedValue(new Error("Outbox down"));
  mocks.jobs.mockRejectedValue(new Error("Database down"));
  await POST(new NextRequest("http://localhost/api/jobs/process", {
    method: "POST", headers: { "x-job-worker-secret": "test-worker" }, body: "{}",
  }));
  await mocks.after.mock.calls[0][0]();
  expect(mocks.log).toHaveBeenCalledWith("error", "generation_worker_crashed", expect.objectContaining({ error: "Database down" }));
});

it("recovers a transient gateway timeout on a read", async () => {
  vi.useFakeTimers();
  const read = vi.fn().mockResolvedValueOnce({ error: { message: "Gateway Timeout" }, status: 504 })
    .mockResolvedValue({ data: [], error: null, status: 200 });
  const result = retryDatabaseRead("test", read);
  await vi.runAllTimersAsync();
  expect(await result).toEqual({ data: [], error: null, status: 200 });
  expect(read).toHaveBeenCalledTimes(2);
});

it("caps retries and preserves the final failure", async () => {
  vi.useFakeTimers();
  const failure = { error: { message: "Gateway Timeout" }, status: 504 };
  const read = vi.fn().mockResolvedValue(failure);
  const result = retryDatabaseRead("test", read);
  await vi.runAllTimersAsync();
  expect(await result).toBe(failure);
  expect(read).toHaveBeenCalledTimes(3);
});

it("does not retry authentication or schema errors", async () => {
  const failure = { error: { message: "Unauthorized" }, status: 401 };
  const read = vi.fn().mockResolvedValue(failure);
  expect(await retryDatabaseRead("test", read)).toBe(failure);
  expect(read).toHaveBeenCalledTimes(1);
});

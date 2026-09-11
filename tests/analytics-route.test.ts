import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  guest: vi.fn(),
  context: vi.fn(),
  track: vi.fn(),
  project: vi.fn(),
  limit: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user, getGuestToken: mocks.guest }));
vi.mock("@/lib/analytics/server", () => ({ readServerAnalyticsContext: mocks.context, safeTrackEvent: mocks.track }));
vi.mock("@/lib/db/repository", () => ({ getProject: mocks.project }));
vi.mock("@/lib/security/rate-limit", () => ({ rateLimit: mocks.limit }));

import { POST } from "@/app/api/analytics/route";

const makeRequest = (body: unknown, origin = "https://memoriestomelody.com") => new NextRequest("https://memoriestomelody.com/api/analytics", {
  method: "POST",
  headers: { "content-type": "application/json", origin, "x-forwarded-for": "203.0.113.8" },
  body: JSON.stringify(body),
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue(null);
  mocks.guest.mockResolvedValue("guest-token");
  mocks.context.mockResolvedValue({ visitorId: "11111111-1111-4111-8111-111111111111", sessionId: "22222222-2222-4222-8222-222222222222", firstTouch: { source: "tiktok" }, lastTouch: { source: "tiktok" }, isInternal: false });
  mocks.limit.mockResolvedValue({ success: true, remaining: 89 });
  mocks.project.mockResolvedValue({ id: "33333333-3333-4333-8333-333333333333", userId: null, guestToken: "guest-token" });
});

it("rejects unapproved events and cross-origin submissions", async () => {
  expect((await POST(makeRequest({ eventId: crypto.randomUUID(), eventName: "purchase", properties: {} }))).status).toBe(400);
  expect((await POST(makeRequest({ eventId: crypto.randomUUID(), eventName: "page_view", properties: { path: "/" } }, "https://attacker.test"))).status).toBe(403);
  expect(mocks.track).not.toHaveBeenCalled();
});

it("drops sensitive and unexpected properties before persistence", async () => {
  const response = await POST(makeRequest({
    eventId: "44444444-4444-4444-8444-444444444444",
    eventName: "page_view",
    properties: { path: "/pricing?utm_source=tiktok", story: "private story", recipient: "Private Name" },
  }));
  expect(response.status).toBe(202);
  expect(mocks.track).toHaveBeenCalledWith("page_view", { path: "/pricing" }, expect.objectContaining({ pagePath: "/pricing", dedupeKey: "client:44444444-4444-4444-8444-444444444444" }));
  expect(JSON.stringify(mocks.track.mock.calls)).not.toContain("private story");
});

it("requires guest or account ownership for checkout events", async () => {
  mocks.project.mockResolvedValue({ id: "33333333-3333-4333-8333-333333333333", userId: null, guestToken: "another-token" });
  const response = await POST(makeRequest({
    eventId: crypto.randomUUID(),
    eventName: "checkout_viewed",
    projectId: "33333333-3333-4333-8333-333333333333",
    properties: { path: "/studio/33333333-3333-4333-8333-333333333333/checkout" },
  }));
  expect(response.status).toBe(404);
  expect(mocks.track).not.toHaveBeenCalled();
});

it("silently ignores staff and test traffic", async () => {
  mocks.context.mockResolvedValue({ isInternal: true });
  const response = await POST(makeRequest({ eventId: crypto.randomUUID(), eventName: "page_view", properties: { path: "/" } }));
  expect(response.status).toBe(202);
  expect(mocks.track).not.toHaveBeenCalled();
});

it("silently ignores requests without a consented analytics identity", async () => {
  mocks.context.mockResolvedValue({ visitorId: null, sessionId: null, isInternal: false });
  const response = await POST(makeRequest({ eventId: crypto.randomUUID(), eventName: "page_view", properties: { path: "/" } }));
  expect(response.status).toBe(202);
  expect(mocks.limit).not.toHaveBeenCalled();
  expect(mocks.track).not.toHaveBeenCalled();
});

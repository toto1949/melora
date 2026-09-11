import { beforeEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";
import type { Order, Project, Profile } from "@/types";
const mocks = vi.hoisted(() => ({ getOrder: vi.fn(), rpc: vi.fn(), retrieve: vi.fn(), create: vi.fn(), price: vi.fn(), intent: vi.fn(), charge: vi.fn(), env: { USE_MOCK_PROVIDERS: false, STRIPE_SECRET_KEY: "sk_test_fixture", STRIPE_WEBHOOK_SECRET: "whsec_test_fixture", STRIPE_PRICE_ID: "price_song", NEXT_PUBLIC_APP_URL: "http://localhost:3000" } }));
vi.mock("@/lib/env", () => ({ getEnv: () => mocks.env, isMockMode: () => false }));
vi.mock("@/lib/db/repository", () => ({ getOrder: mocks.getOrder }));
vi.mock("@/lib/db/client", () => ({ getSupabaseAdmin: () => ({ rpc: mocks.rpc }) }));
vi.mock("stripe", async (original) => {
  const actual = await original<typeof import("stripe")>();
  return { default: class extends actual.default {
    constructor(key: string) { super(key); this.checkout.sessions.retrieve = mocks.retrieve; this.checkout.sessions.create = mocks.create; this.prices.retrieve = mocks.price; this.paymentIntents.retrieve = mocks.intent; this.charges.retrieve = mocks.charge; }
  } };
});
import { createCheckoutSession } from "@/lib/stripe/client";
import { POST } from "@/app/api/stripe/webhook/route";
import { ownsOrder, ownsProject } from "@/lib/security/ownership";
const oid = "11111111-1111-4111-8111-111111111111";
const order = { id: oid, subtotalCents: 1999, discountCents: 0, totalCents: 1999, currency: "usd", email: "buyer@example.test", paymentStatus: "pending", stripeCheckoutSessionId: "cs_song", stripePriceId: "price_song", checkoutAttempt: 1, checkoutExpiresAt: new Date(Date.now()+1860_000).toISOString() } as Order;
function session(overrides = {}) { return { id: "cs_song", object: "checkout.session", mode: "payment", status: "complete", payment_status: "paid", livemode: false, metadata: { order_id: oid }, amount_subtotal: 1999, amount_total: 2159, currency: "usd", total_details: { amount_tax: 160, amount_discount: 0 }, payment_intent: { id: "pi_song", metadata: { order_id: oid }, currency: "usd", amount: 2159, amount_received: 2159, status: "succeeded", livemode: false, latest_charge: { amount_refunded: 0, refunded: false, disputed: false } }, line_items: { data: [{ quantity: 1, price: { id: "price_song", unit_amount: 1999 } }], has_more: false }, ...overrides }; }
async function webhook(type = "checkout.session.completed", object = { object: "checkout.session", id: "cs_song" }, signature?: string) {
  const payload = JSON.stringify({ id: "evt_fixture", object: "event", type, livemode: false, data: { object } });
  const stripe = new Stripe("sk_test_fixture");
  const header = signature ?? stripe.webhooks.generateTestHeaderString({ payload, secret: mocks.env.STRIPE_WEBHOOK_SECRET });
  return POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body: payload, headers: { "stripe-signature": header } }));
}
beforeEach(() => { vi.clearAllMocks(); mocks.getOrder.mockResolvedValue(order); mocks.rpc.mockResolvedValue({ data: true, error: null }); mocks.retrieve.mockResolvedValue(session()); mocks.price.mockResolvedValue({ id: "price_song", active: true, unit_amount: 1999, currency: "usd", type: "one_time", tax_behavior: "exclusive" }); mocks.create.mockResolvedValue({ id: "cs_song", url: "https://checkout.stripe.com/test" }); });
describe("Stripe payment boundary", () => {
  it("creates Checkout with the existing price, automatic tax and identifier-only metadata", async () => {
    await createCheckoutSession({ ...order, stripeCheckoutSessionId: null }, "http://localhost/payment-success", "http://localhost/payment-cancelled");
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ line_items: [{ price: "price_song", quantity: 1 }], automatic_tax: { enabled: true }, metadata: { order_id: oid } }), { idempotencyKey: `checkout:${oid}:1` });
    expect(mocks.rpc).toHaveBeenCalledWith("bind_checkout", expect.objectContaining({ p_order: oid }));
  });
  it("reuses an open Session instead of creating another charge opportunity", async () => {
    mocks.retrieve.mockResolvedValue(session({ status: "open", url: "https://checkout.stripe.com/test" }));
    await createCheckoutSession(order, "success", "cancel"); expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects a misconfigured price", async () => {
    mocks.price.mockResolvedValue({ active: true, type: "one_time", unit_amount: 999, currency: "usd" });
    await expect(createCheckoutSession({ ...order, stripeCheckoutSessionId: null }, "success", "cancel")).rejects.toThrow(); expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects an invalid cryptographic webhook signature", async () => { expect((await webhook(undefined, undefined, "t=1,v1=invalid")).status).toBe(400); expect(mocks.rpc).not.toHaveBeenCalled(); });
  it("accepts a valid raw signed event and transactionally confirms payment", async () => { expect((await webhook()).status).toBe(200); expect(mocks.rpc).toHaveBeenCalledWith("apply_stripe_event", expect.objectContaining({ p_state: "paid", p_total: 2159, p_tax: 160, p_intent: "pi_song" })); });
  it("never authorizes unpaid completed sessions", async () => { mocks.retrieve.mockResolvedValue(session({ payment_status: "unpaid" })); expect((await webhook()).status).toBe(200); expect(mocks.rpc).not.toHaveBeenCalled(); });
  it("rejects another order's payment", async () => { mocks.retrieve.mockResolvedValue(session({ metadata: { order_id: "other" } })); expect((await webhook()).status).toBe(500); expect(mocks.rpc).not.toHaveBeenCalled(); });
  it("returns 500 for transactional failures so Stripe retries", async () => { mocks.rpc.mockResolvedValue({ error: { message: "db offline" } }); expect((await webhook()).status).toBe(500); });
  it("acknowledges a duplicate without side effects outside the database", async () => { mocks.rpc.mockResolvedValue({ data: false }); expect((await webhook()).status).toBe(200); expect(mocks.create).not.toHaveBeenCalled(); });
  it("handles async success", async () => { expect((await webhook("checkout.session.async_payment_succeeded")).status).toBe(200); });
  it("uses current refund state even when a delayed paid event arrives", async () => { const s=session(); s.payment_intent.latest_charge={ amount_refunded: 2159, refunded: true, disputed: false }; mocks.retrieve.mockResolvedValue(s); await webhook(); expect(mocks.rpc).toHaveBeenCalledWith("apply_stripe_event", expect.objectContaining({ p_state: "refunded" })); });
  it("handles charge.refunded via the authoritative PaymentIntent association", async () => { const s=session(); s.payment_intent.latest_charge={ amount_refunded: 2159, refunded: true, disputed: false }; mocks.intent.mockResolvedValue(s.payment_intent); mocks.retrieve.mockResolvedValue(s); await webhook("charge.refunded", { object: "charge", id: "ch_song", payment_intent: "pi_song" } as never); expect(mocks.rpc).toHaveBeenCalledWith("apply_stripe_event", expect.objectContaining({ p_state: "refunded" })); });
});
describe("owner and guest authorization", () => {
  const user = { id: "owner" } as Profile;
  it("requires authenticated ownership for an account order", () => {
    expect(ownsOrder({ ...order, userId: "owner" }, user, null)).toBe(true);
    expect(ownsOrder({ ...order, userId: "owner" }, { id: "attacker" } as Profile, null)).toBe(false);
    expect(ownsOrder({ ...order, userId: "owner" }, null, "guest-secret")).toBe(false);
  });
  it("requires the guest cookie even when the UUID is known", () => {
    const project = { userId: null, guestToken: "unguessable-secret" } as Project;
    expect(ownsProject(project, null, null)).toBe(false);
    expect(ownsProject(project, user, "wrong")).toBe(false);
    expect(ownsOrder({ ...order, userId: null, project }, null, "unguessable-secret")).toBe(true);
  });
});

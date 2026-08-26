import { describe, expect, it } from "vitest";
import { checkoutSchema, recipientSchema, storySchema } from "@/lib/validation/studio";

describe("studio validation", () => {
  it("requires recipient name", () => {
    const result = recipientSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("requires an address when direct recipient delivery is enabled", () => {
    const missingEmail = recipientSchema.safeParse({
      name: "Avery",
      email: null,
      sendGiftEmail: true,
    });
    const validDelivery = recipientSchema.safeParse({
      name: "Avery",
      email: "avery@example.com",
      sendGiftEmail: true,
    });

    expect(missingEmail.success).toBe(false);
    expect(validDelivery.success).toBe(true);
  });

  it("accepts a valid story", () => {
    const result = storySchema.safeParse({
      favoriteMemory: "We danced in the kitchen every Sunday.",
      whatMakesSpecial: "Your patience and quiet humor.",
    });
    expect(result.success).toBe(true);
  });

  it("requires terms acceptance at checkout", () => {
    const result = checkoutSchema.safeParse({
      packageId: "pkg-essential",
      email: "friend@example.com",
      termsAccepted: false,
      idempotencyKey: "idem-12345678",
    });
    expect(result.success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { rateLimit } from "@/lib/security/rate-limit";
import {
  interpretScannerResponse,
  isCloudmersiveScanner,
  usesBuiltinScanner,
} from "@/lib/security/malware-scanner";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("my-secret-password");
    expect(hash).toContain(":");
    expect(await verifyPassword("my-secret-password", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct-password");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects malformed stored hashes", async () => {
    expect(await verifyPassword("anything", "not-a-valid-hash")).toBe(false);
    expect(await verifyPassword("anything", "")).toBe(false);
  });

  it("produces unique hashes per call (salted)", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
  });
});

describe("rate limiting (in-memory fallback)", () => {
  it("allows requests under the limit", async () => {
    const key = `test-${Date.now()}-a`;
    for (let i = 0; i < 5; i++) {
      const result = await rateLimit(key, 5, 60_000);
      expect(result.success).toBe(true);
    }
  });

  it("blocks requests over the limit", async () => {
    const key = `test-${Date.now()}-b`;
    for (let i = 0; i < 3; i++) await rateLimit(key, 3, 60_000);
    const result = await rateLimit(key, 3, 60_000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks separate keys independently", async () => {
    const base = `test-${Date.now()}`;
    await rateLimit(`${base}-x`, 1, 60_000);
    const other = await rateLimit(`${base}-y`, 1, 60_000);
    expect(other.success).toBe(true);
  });
});

describe("malware scanner adapters", () => {
  it("recognizes the built-in launch scanner mode", () => {
    expect(usesBuiltinScanner("builtin")).toBe(true);
    expect(usesBuiltinScanner(" BUILTIN ")).toBe(true);
    expect(usesBuiltinScanner("https://scanner.example.com/scan")).toBe(false);
  });

  it("recognizes Cloudmersive endpoints", () => {
    expect(isCloudmersiveScanner("https://api.cloudmersive.com/virus/scan/file")).toBe(true);
    expect(isCloudmersiveScanner("https://scanner.example.com/scan")).toBe(false);
  });

  it("interprets Cloudmersive and generic responses fail-closed", () => {
    expect(interpretScannerResponse({ CleanResult: true })).toBe("clean");
    expect(interpretScannerResponse({ CleanResult: false })).toBe("infected");
    expect(interpretScannerResponse({ status: "clean" })).toBe("clean");
    expect(interpretScannerResponse({})).toBe("failed");
  });
});

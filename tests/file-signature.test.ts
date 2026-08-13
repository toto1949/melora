import { describe, expect, it } from "vitest";
import { matchesDeclaredFileType } from "@/lib/security/file-signature";

describe("upload file signatures", () => {
  it("accepts supported signatures", () => {
    expect(matchesDeclaredFileType(new Uint8Array([0xff, 0xd8, 0xff, 0x00]), "image/jpeg")).toBe(true);
    expect(matchesDeclaredFileType(new TextEncoder().encode("RIFF0000WEBP"), "image/webp")).toBe(true);
    expect(matchesDeclaredFileType(new TextEncoder().encode("0000ftypisom"), "video/mp4")).toBe(true);
  });

  it("rejects extension-only or mismatched content", () => {
    const executable = new TextEncoder().encode("MZ not really an image");
    expect(matchesDeclaredFileType(executable, "image/jpeg")).toBe(false);
    expect(matchesDeclaredFileType(executable, "video/mp4")).toBe(false);
    expect(matchesDeclaredFileType(executable, "application/octet-stream")).toBe(false);
  });
});

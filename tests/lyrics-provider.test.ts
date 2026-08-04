import { describe, expect, it } from "vitest";
import { MockLyricsProvider } from "@/lib/providers/lyrics/mock";

describe("MockLyricsProvider", () => {
  it("generates titled lyrics from a brief", async () => {
    const provider = new MockLyricsProvider();
    const result = await provider.generateLyrics({
      recipientName: "Avery",
      occasion: "birthday",
      relationship: "partner",
      storyHighlights: ["coffee on rainy mornings"],
      genre: "acoustic",
      mood: "Romantic",
      vocalType: "Soft female",
      language: "en",
      lyricTone: "Romantic",
      mustInclude: ["Avery"],
      mustExclude: [],
      chorusMessage: null,
      personalMessage: "I choose you every day",
    });

    expect(result.title.toLowerCase()).toContain("avery");
    expect(result.lyrics.length).toBeGreaterThan(40);
    expect(result.timedLyrics.length).toBeGreaterThan(0);
    expect(result.provider).toBe("mock-lyrics");
  });
});

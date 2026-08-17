import { describe, expect, it } from "vitest";
import { normalizeLyrics, splitLyricsSections } from "@/lib/lyrics";

describe("lyrics formatting", () => {
  it("turns nested provider JSON into plain lyric sections", () => {
    const raw = JSON.stringify({
      title: "For Avery",
      lyrics: {
        "verse_1": ["Coffee in the morning", "Rain against the glass"],
        chorus: "Every road still leads me home",
      },
      timedLyrics: [{ start: 0, end: 4, text: "Coffee in the morning" }],
    });

    const formatted = normalizeLyrics(raw);
    expect(formatted).toContain("Verse 1");
    expect(formatted).toContain("Coffee in the morning");
    expect(formatted).toContain("Chorus");
    expect(formatted).not.toContain("{\"");
    expect(formatted).not.toContain("timedLyrics");
  });

  it("removes JSON fences and creates readable display sections", () => {
    const raw = '```json\n{"lyrics":"Verse 1\\nFirst line\\nSecond line\\n\\nChorus\\nSing it home"}\n```';
    const sections = splitLyricsSections(raw);

    expect(sections).toEqual([
      { title: "Verse 1", lines: ["First line", "Second line"] },
      { title: "Chorus", lines: ["Sing it home"] },
    ]);
  });

  it("recognizes Arabic section headings", () => {
    expect(splitLyricsSections("المقطع 1\nسطر أول\nاللازمة\nهذا هو اللحن")).toEqual([
      { title: "المقطع 1", lines: ["سطر أول"] },
      { title: "اللازمة", lines: ["هذا هو اللحن"] },
    ]);
  });
});

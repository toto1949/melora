import type { CreativeBrief, LyricsProvider, LyricsResult } from "../types";

export class MockLyricsProvider implements LyricsProvider {
  name = "mock-lyrics";

  async generateLyrics(brief: CreativeBrief): Promise<LyricsResult> {
    const name = brief.recipientName || "you";
    const occasion = brief.occasion || "this moment";
    const title = `${name}'s ${occasion.charAt(0).toUpperCase()}${occasion.slice(1)} Song`;

    const chorus =
      brief.chorusMessage ||
      `For ${name}, through every season we share / I keep your light like a prayer`;

    const memory = brief.storyHighlights[0] || "the moments we never want to lose";
    const special = brief.storyHighlights[1] || "the way you make ordinary days feel bright";

    const lines = [
      `Verse 1`,
      `I still remember ${memory}`,
      `A quiet truth that time could never move`,
      `Every detail folded into melody`,
      `A keepsake made of love and honesty`,
      ``,
      `Chorus`,
      chorus,
      `On this ${occasion}, let the music say`,
      `What my heart has carried every day`,
      ``,
      `Verse 2`,
      `${special}`,
      brief.personalMessage ? `And I want you to know: ${brief.personalMessage}` : `And I want you to know how deeply you are seen`,
      `No perfect words, just this sincere refrain`,
      `Your name forever written in the grain`,
      ``,
      `Bridge`,
      brief.mustInclude.length
        ? `We hold these words close: ${brief.mustInclude.slice(0, 3).join(", ")}`
        : `We hold these memories close and true`,
      `A song for ${brief.relationship || "someone precious"} — forever new`,
      ``,
      `Chorus`,
      chorus,
    ];

    const lyrics = lines.join("\n");
    const lyricLines = lyrics
      .split("\n")
      .filter((l) => l && !l.startsWith("Verse") && !l.startsWith("Chorus") && !l.startsWith("Bridge"));

    const timedLyrics = lyricLines.map((text, index) => ({
      start: index * 4,
      end: index * 4 + 3.5,
      text,
    }));

    return {
      title,
      lyrics,
      timedLyrics,
      provider: this.name,
    };
  }
}

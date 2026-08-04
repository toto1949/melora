import { getEnv } from "@/lib/env";
import type { CreativeBrief, LyricsProvider, LyricsResult } from "../types";
import { MockLyricsProvider } from "./mock";

export class OpenAICompatibleLyricsProvider implements LyricsProvider {
  name = "openai-compatible-lyrics";

  async generateLyrics(brief: CreativeBrief): Promise<LyricsResult> {
    const env = getEnv();
    if (!env.OPENAI_API_KEY) {
      return new MockLyricsProvider().generateLyrics(brief);
    }

    const baseUrl = (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content:
              "You write warm, original personalized song lyrics. Return JSON with title, lyrics, and timedLyrics array of {start,end,text}.",
          },
          {
            role: "user",
            content: JSON.stringify(brief),
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("Lyrics provider error", await response.text());
      return new MockLyricsProvider().generateLyrics(brief);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return new MockLyricsProvider().generateLyrics(brief);

    const parsed = JSON.parse(content) as LyricsResult;
    return {
      title: parsed.title,
      lyrics: parsed.lyrics,
      timedLyrics: parsed.timedLyrics ?? [],
      provider: this.name,
      raw: parsed,
    };
  }
}

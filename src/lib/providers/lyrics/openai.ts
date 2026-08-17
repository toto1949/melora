import { getEnv } from "@/lib/env";
import { normalizeLyrics } from "@/lib/lyrics";
import type { CreativeBrief, LyricsProvider, LyricsResult } from "../types";
import { MockLyricsProvider } from "./mock";

function parseProviderJson(content: string) {
  const fenced = content.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return JSON.parse(fenced?.[1] ?? content) as Record<string, unknown>;
}

function timedLyrics(value: unknown): LyricsResult["timedLyrics"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const line = item as Record<string, unknown>;
    const text = normalizeLyrics(line.text);
    const start = Number(line.start);
    const end = Number(line.end);
    if (!text || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
    return [{ start, end, text }];
  });
}

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
              "You write warm, original personalized song lyrics in the requested language and musical genre. Return JSON with title, lyrics, and timedLyrics. The lyrics value must be one plain-text string with section headings and line breaks, never a nested object, array, Markdown fence, or second JSON document. timedLyrics is an array of {start,end,text}.",
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

    try {
      const parsed = parseProviderJson(content);
      const lyrics = normalizeLyrics(parsed.lyrics ?? parsed.sections ?? parsed);
      if (!lyrics) throw new Error("Lyrics provider returned empty lyrics");
      return {
        title:
          typeof parsed.title === "string" && parsed.title.trim()
            ? parsed.title.trim()
            : `${brief.recipientName}'s Song`,
        lyrics,
        timedLyrics: timedLyrics(parsed.timedLyrics ?? parsed.timed_lyrics),
        provider: this.name,
        raw: parsed,
      };
    } catch (error) {
      console.error(
        "Lyrics provider returned invalid structured output",
        error instanceof Error ? error.message : "Unknown parsing error",
      );
      return new MockLyricsProvider().generateLyrics(brief);
    }
  }
}

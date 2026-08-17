export interface LyricSection {
  title: string | null;
  lines: string[];
}

const METADATA_KEYS = new Set([
  "title",
  "provider",
  "raw",
  "timedlyrics",
  "timed_lyrics",
]);

const SECTION_HEADING = new RegExp(
  "^(?:verse(?:\\s+\\d+)?|pre[-\\s]?chorus|chorus|bridge|hook|intro|outro|refrain|" +
    "couplet(?:\\s+\\d+)?|pont|estrofa(?:\\s+\\d+)?|verso(?:\\s+\\d+)?|coro|puente|" +
    "المقطع(?:\\s+\\d+)?|اللازمة|الجسر|المقدمة|الخاتمة)$",
  "i",
);

function stripCodeFence(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match?.[1]?.trim() ?? trimmed;
}

function displayKey(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim();
}

function normalizeStructuredSection(value: Record<string, unknown>, depth: number) {
  const title = value.section ?? value.heading ?? value.name ?? value.type ?? value.title;
  const content = value.lines ?? value.text ?? value.content ?? value.lyrics;
  if (content == null) return "";
  const body = normalizeLyricsValue(content, depth + 1);
  if (!body) return "";
  return typeof title === "string" && title.trim()
    ? `${displayKey(title)}\n${body}`
    : body;
}

function normalizeLyricsValue(value: unknown, depth: number): string {
  if (value == null || depth > 5) return "";

  if (typeof value === "string") {
    const text = stripCodeFence(value);
    if (!text) return "";

    if (
      depth < 5 &&
      ((text.startsWith("{") && text.endsWith("}")) ||
        (text.startsWith("[") && text.endsWith("]")) ||
        (text.startsWith('"') && text.endsWith('"')))
    ) {
      try {
        return normalizeLyricsValue(JSON.parse(text), depth + 1);
      } catch {
        // The text only resembles JSON. Preserve it as lyrics.
      }
    }

    return text.includes("\\n") && !text.includes("\n")
      ? text.replaceAll("\\n", "\n")
      : text;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          return normalizeStructuredSection(item as Record<string, unknown>, depth);
        }
        return normalizeLyricsValue(item, depth + 1);
      })
      .filter(Boolean)
      .join("\n\n");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.lyrics != null) return normalizeLyricsValue(record.lyrics, depth + 1);
    if (record.sections != null) return normalizeLyricsValue(record.sections, depth + 1);

    return Object.entries(record)
      .filter(([key]) => !METADATA_KEYS.has(key.toLowerCase()))
      .map(([key, content]) => {
        const body = normalizeLyricsValue(content, depth + 1);
        return body ? `${displayKey(key)}\n${body}` : "";
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return String(value);
}

export function normalizeLyrics(value: unknown) {
  return normalizeLyricsValue(value, 0)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseHeading(line: string) {
  const trimmed = line.trim();
  const bracketed = trimmed.match(/^\[(.+)]$/);
  if (bracketed?.[1]) return bracketed[1].trim();

  const withoutColon = trimmed.replace(/:$/, "").trim();
  if (SECTION_HEADING.test(withoutColon)) return withoutColon;
  if (trimmed.endsWith(":") && withoutColon.length <= 40) return withoutColon;
  return null;
}

export function splitLyricsSections(value: unknown): LyricSection[] {
  const lyrics = normalizeLyrics(value);
  if (!lyrics) return [];

  const sections: LyricSection[] = [];
  let current: LyricSection = { title: null, lines: [] };

  const commit = () => {
    if (current.title || current.lines.length) sections.push(current);
    current = { title: null, lines: [] };
  };

  for (const rawLine of lyrics.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const heading = parseHeading(line);
    if (heading) {
      commit();
      current.title = heading;
      continue;
    }
    current.lines.push(line);
  }
  commit();

  return sections;
}

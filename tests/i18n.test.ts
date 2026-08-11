import { describe, expect, it } from "vitest";
import ar from "../messages/ar.json";
import en from "../messages/en.json";
import es from "../messages/es.json";
import fr from "../messages/fr.json";
import { isSupportedLocale, translate } from "@/lib/i18n";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === "object"
      ? flattenKeys(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe("i18n dictionaries", () => {
  const enKeys = new Set(flattenKeys(en));

  it.each([
    ["es", es],
    ["fr", fr],
    ["ar", ar],
  ])("%s has full key parity with en", (_name, dict) => {
    const keys = new Set(flattenKeys(dict as Record<string, unknown>));
    for (const key of enKeys) {
      expect(keys.has(key), `missing key: ${key}`).toBe(true);
    }
  });

  it("translate resolves nested keys", () => {
    expect(translate(en, "nav.pricing")).toBe("Pricing");
  });

  it("translate falls back to the key when missing", () => {
    expect(translate(en, "nonexistent.key")).toBe("nonexistent.key");
  });
});

describe("locale validation", () => {
  it("accepts supported locales", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("ar")).toBe(true);
  });

  it("rejects unsupported values", () => {
    expect(isSupportedLocale("de")).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
    expect(isSupportedLocale(null)).toBe(false);
  });
});

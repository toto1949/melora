import { describe, expect, it } from "vitest";
import { formatCurrency, formatDuration, slugify } from "@/lib/utils";

describe("utils", () => {
  it("formats currency from cents", () => {
    expect(formatCurrency(3900, "usd", "en")).toContain("39");
  });

  it("formats duration", () => {
    expect(formatDuration(125)).toBe("2:05");
  });

  it("slugifies text", () => {
    expect(slugify("Mother's Day!")).toBe("mother-s-day");
  });
});

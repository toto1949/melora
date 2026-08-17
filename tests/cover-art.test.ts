import { describe, expect, it } from "vitest";
import { GENRES } from "@/lib/constants";
import { createGeneratedCoverUrl, getGenreCoverPalette } from "@/lib/cover-art";
import { GET } from "@/app/api/covers/generated/route";

describe("genre-aware cover artwork", () => {
  it("has a warm palette for every supported genre", () => {
    for (const genre of GENRES) {
      const palette = getGenreCoverPalette(genre.slug);
      expect(palette.background).toMatch(/^#[0-9A-F]{6}$/i);
      expect(palette.accent).toMatch(/^#[0-9A-F]{6}$/i);
      expect(palette.glow).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("builds a URL containing the selected musical direction", () => {
    const url = createGeneratedCoverUrl({
      title: "A Song for Avery",
      genre: "rnb",
      mood: "Romantic",
      occasion: "anniversary",
    });
    expect(url).toContain("title=A+Song+for+Avery");
    expect(url).toContain("genre=rnb");
    expect(url).toContain("mood=Romantic");
  });

  it("renders safe SVG text instead of injecting title markup", async () => {
    const response = await GET(
      new Request(
        "https://memoriestomelody.com/api/covers/generated?title=%3Cscript%3Ehello%3C%2Fscript%3E&genre=latin&mood=Uplifting",
      ),
    );
    const svg = await response.text();

    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(svg).toContain("&lt;script&gt;hello&lt;/script&gt;");
    expect(svg).not.toContain("<script>hello</script>");
  });
});

import type { CoverArtProvider, CoverArtResult } from "../types";

export class BuiltInCoverArtProvider implements CoverArtProvider {
  name = "builtin-cover";

  async generateCover(input: {
    title: string;
    occasion: string;
    mood: string;
  }): Promise<CoverArtResult> {
    void input.occasion;
    void input.mood;
    const label = encodeURIComponent(input.title.slice(0, 28));
    return {
      imageUrl: `/samples/covers/generated.svg?title=${label}`,
      provider: this.name,
    };
  }
}

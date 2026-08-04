import type { CoverArtProvider, CoverArtResult } from "../types";

export class MockCoverArtProvider implements CoverArtProvider {
  name = "mock-cover";

  async generateCover(input: {
    title: string;
    occasion: string;
    mood: string;
  }): Promise<CoverArtResult> {
    const label = encodeURIComponent(input.title.slice(0, 28));
    return {
      imageUrl: `/samples/covers/generated.svg?title=${label}`,
      provider: this.name,
    };
  }
}

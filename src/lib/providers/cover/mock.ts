import type { CoverArtProvider, CoverArtResult } from "../types";
import { createGeneratedCoverUrl } from "@/lib/cover-art";

export class MockCoverArtProvider implements CoverArtProvider {
  name = "mock-cover";

  async generateCover(input: {
    title: string;
    occasion: string;
    genre: string;
    mood: string;
  }): Promise<CoverArtResult> {
    return {
      imageUrl: createGeneratedCoverUrl(input),
      provider: this.name,
    };
  }
}

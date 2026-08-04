import type { MusicProvider, MusicResult } from "../types";

export class MockMusicProvider implements MusicProvider {
  name = "mock-music";

  async generateMusic(input: {
    brief: { genre: string; mood: string; vocalType: string };
    lyrics: string;
    title: string;
  }): Promise<MusicResult> {
    // Local demo audio asset — replace with real provider output in production.
    void input;
    return {
      audioUrl: "/samples/audio/placeholder-tone.wav",
      durationSeconds: 180,
      format: "mp3",
      provider: this.name,
      providerJobId: `mock-music-${Date.now()}`,
    };
  }
}

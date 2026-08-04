import type { VideoProvider, VideoResult } from "../types";

export class MockVideoProvider implements VideoProvider {
  name = "mock-video";

  async generateVideo(input: {
    title: string;
    audioUrl: string;
    style: string;
    photoUrls: string[];
    lyrics?: string;
  }): Promise<VideoResult> {
    void input;
    return {
      videoUrl: "/samples/reactions/demo-reaction.mp4",
      durationSeconds: 180,
      provider: this.name,
      style: input.style,
    };
  }
}

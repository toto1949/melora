export interface CreativeBrief {
  recipientName: string;
  occasion: string;
  relationship: string | null;
  storyHighlights: string[];
  genre: string;
  mood: string;
  vocalType: string;
  language: string;
  lyricTone: string;
  mustInclude: string[];
  mustExclude: string[];
  chorusMessage: string | null;
  personalMessage: string | null;
}

export interface LyricsResult {
  title: string;
  lyrics: string;
  timedLyrics: Array<{ start: number; end: number; text: string }>;
  provider: string;
  raw?: unknown;
}

export interface MusicResult {
  audioUrl: string;
  durationSeconds: number;
  format: "mp3" | "wav";
  provider: string;
  providerJobId?: string;
  /** Cover art produced alongside the track (e.g. Suno), if any. */
  coverUrl?: string;
  /** Additional track variations beyond the primary audioUrl. */
  alternateAudioUrls?: string[];
}

export interface CoverArtResult {
  imageUrl: string;
  provider: string;
}

export interface VideoResult {
  videoUrl: string;
  durationSeconds: number;
  provider: string;
  style: string;
}

export interface LyricsProvider {
  name: string;
  generateLyrics(brief: CreativeBrief): Promise<LyricsResult>;
}

export interface MusicProvider {
  name: string;
  generateMusic(input: {
    brief: CreativeBrief;
    lyrics: string;
    title: string;
    /** Stable key so provider retries resume the same generation instead of paying for a new one. */
    idempotencyKey?: string;
    onProviderJobId?: (providerJobId: string) => void | Promise<void>;
    /** Reports provider progress on the pipeline job's 0-100 scale. */
    onProgress?: (progress: number) => void | Promise<void>;
  }): Promise<MusicResult>;
}

export interface VideoProvider {
  name: string;
  generateVideo(input: {
    title: string;
    audioUrl: string;
    style: string;
    photoUrls: string[];
    lyrics?: string;
  }): Promise<VideoResult>;
}

export interface CoverArtProvider {
  name: string;
  generateCover(input: {
    title: string;
    occasion: string;
    genre: string;
    mood: string;
  }): Promise<CoverArtResult>;
}

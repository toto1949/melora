export type CoverMotif = "pulse" | "sun" | "vinyl" | "waves" | "stars";

export interface CoverPalette {
  background: string;
  middle: string;
  accent: string;
  glow: string;
  motif: CoverMotif;
}

const DEFAULT_PALETTE: CoverPalette = {
  background: "#18243A",
  middle: "#8E4F55",
  accent: "#E6B86A",
  glow: "#F4D7C7",
  motif: "pulse",
};

const GENRE_PALETTES: Record<string, CoverPalette> = {
  pop: { background: "#3C1831", middle: "#C25765", accent: "#F3B65F", glow: "#FFD7C8", motif: "pulse" },
  rnb: { background: "#25162D", middle: "#7D4057", accent: "#D9A45E", glow: "#EAC6B7", motif: "vinyl" },
  country: { background: "#3B2118", middle: "#A85B36", accent: "#E8B866", glow: "#F2D7AE", motif: "sun" },
  acoustic: { background: "#3A2821", middle: "#A7694E", accent: "#DDBA79", glow: "#F1D7BD", motif: "waves" },
  rock: { background: "#23181D", middle: "#8D3438", accent: "#E19A4B", glow: "#E9B5A5", motif: "pulse" },
  "hip-hop": { background: "#24182E", middle: "#7F3F52", accent: "#E5A34F", glow: "#E8C0A4", motif: "vinyl" },
  soul: { background: "#351A25", middle: "#A24D4D", accent: "#E4AE62", glow: "#F0C8AF", motif: "sun" },
  jazz: { background: "#261923", middle: "#74404A", accent: "#C98A58", glow: "#E7C0A4", motif: "vinyl" },
  classical: { background: "#272035", middle: "#77505C", accent: "#D4AD6A", glow: "#E9D3B4", motif: "waves" },
  gospel: { background: "#3A2327", middle: "#B35F4A", accent: "#EDC36E", glow: "#FFE2B0", motif: "sun" },
  electronic: { background: "#291A3B", middle: "#9C4165", accent: "#F0A55C", glow: "#EAB9CF", motif: "pulse" },
  indie: { background: "#332126", middle: "#A85B5B", accent: "#DDAA70", glow: "#EEC9B8", motif: "stars" },
  latin: { background: "#481D25", middle: "#CF5A3D", accent: "#F2B84E", glow: "#FFD0A6", motif: "sun" },
  afrobeats: { background: "#3E2022", middle: "#C35A38", accent: "#E8B53F", glow: "#F4CE91", motif: "pulse" },
  arabic: { background: "#20233A", middle: "#8E4C4F", accent: "#D6A85F", glow: "#E9CEAD", motif: "stars" },
  custom: DEFAULT_PALETTE,
};

export function getGenreCoverPalette(genre?: string | null) {
  return GENRE_PALETTES[genre?.trim().toLowerCase() || ""] ?? DEFAULT_PALETTE;
}

export function createGeneratedCoverUrl(input: {
  title?: string | null;
  genre?: string | null;
  mood?: string | null;
  occasion?: string | null;
}) {
  const params = new URLSearchParams();
  params.set("title", (input.title || "Your Song").trim().slice(0, 80));
  if (input.genre) params.set("genre", input.genre.trim().slice(0, 32));
  if (input.mood) params.set("mood", input.mood.trim().slice(0, 32));
  if (input.occasion) params.set("occasion", input.occasion.trim().slice(0, 32));
  return `/api/covers/generated?${params.toString()}`;
}

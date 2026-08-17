import { getGenreCoverPalette, type CoverMotif } from "@/lib/cover-art";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function titleLines(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return [title.slice(0, 24), ""];

  const lines = ["", ""];
  for (const word of words) {
    const target = !lines[0] || (lines[0] + " " + word).length <= 20 ? 0 : 1;
    lines[target] = `${lines[target]} ${word}`.trim().slice(0, 26);
  }
  return lines;
}

function motifSvg(motif: CoverMotif, accent: string, glow: string) {
  switch (motif) {
    case "vinyl":
      return `<circle cx="620" cy="210" r="120" fill="none" stroke="${glow}" stroke-opacity=".22" stroke-width="28"/><circle cx="620" cy="210" r="44" fill="${accent}" fill-opacity=".55"/>`;
    case "waves":
      return `<path d="M70 245 C180 165 270 325 380 245 S580 165 730 245" fill="none" stroke="${glow}" stroke-opacity=".34" stroke-width="18"/><path d="M70 290 C180 210 270 370 380 290 S580 210 730 290" fill="none" stroke="${accent}" stroke-opacity=".3" stroke-width="10"/>`;
    case "stars":
      return `<path d="M625 105l18 49 51 2-40 31 14 50-43-28-43 28 14-50-40-31 51-2z" fill="${accent}" fill-opacity=".42"/><circle cx="540" cy="118" r="9" fill="${glow}" fill-opacity=".55"/><circle cx="715" cy="292" r="14" fill="${glow}" fill-opacity=".35"/>`;
    case "sun":
      return `<circle cx="625" cy="185" r="94" fill="${accent}" fill-opacity=".34"/><circle cx="625" cy="185" r="55" fill="${glow}" fill-opacity=".28"/>`;
    default:
      return `<path d="M90 245h70l28-70 55 150 50-112 43 68 45-36h70l35-94 55 174 48-115 40 35h91" fill="none" stroke="${glow}" stroke-opacity=".42" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "Your Song").trim().slice(0, 80);
  const genre = (searchParams.get("genre") || "custom").trim().slice(0, 32);
  const mood = (searchParams.get("mood") || "Made with love").trim().slice(0, 32);
  const occasion = (searchParams.get("occasion") || "A personal keepsake").trim().slice(0, 32);
  const palette = getGenreCoverPalette(genre);
  const [firstLine, secondLine] = titleLines(title);
  const subtitle = [genre.replaceAll("-", " "), mood].filter(Boolean).join(" · ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(title)}</title>
  <desc id="description">Warm ${escapeXml(genre)} cover artwork for ${escapeXml(occasion)}</desc>
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.background}"/>
      <stop offset=".58" stop-color="${palette.middle}"/>
      <stop offset="1" stop-color="${palette.accent}"/>
    </linearGradient>
    <radialGradient id="halo" cx="75%" cy="18%" r="65%">
      <stop offset="0" stop-color="${palette.glow}" stop-opacity=".42"/>
      <stop offset="1" stop-color="${palette.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="8"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 .08"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="800" height="800" rx="42" fill="url(#background)"/>
  <rect width="800" height="800" rx="42" fill="url(#halo)"/>
  <circle cx="90" cy="720" r="210" fill="${palette.background}" fill-opacity=".22"/>
  ${motifSvg(palette.motif, palette.accent, palette.glow)}
  <rect width="800" height="800" rx="42" filter="url(#grain)" opacity=".55"/>
  <text x="64" y="76" fill="${palette.glow}" fill-opacity=".9" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4">MEMORIES TO MELODY</text>
  <text x="64" y="535" fill="#FFFBF7" font-family="Georgia, serif" font-size="62" font-weight="700">${escapeXml(firstLine)}</text>
  ${secondLine ? `<text x="64" y="605" fill="#FFFBF7" font-family="Georgia, serif" font-size="62" font-weight="700">${escapeXml(secondLine)}</text>` : ""}
  <text x="66" y="670" fill="#FFFBF7" fill-opacity=".78" font-family="Arial, sans-serif" font-size="20" letter-spacing="1.5">${escapeXml(subtitle.toUpperCase())}</text>
  <text x="66" y="718" fill="${palette.glow}" fill-opacity=".88" font-family="Arial, sans-serif" font-size="18">${escapeXml(occasion.replaceAll("-", " "))}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

import type { MetadataRoute } from "next";
import { GENRES, OCCASIONS } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const staticRoutes = ["", "/examples", "/how-it-works", "/occasions", "/reviews", "/pricing", "/faq", "/track-order"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    }),
  );
  const occasions = OCCASIONS.map((o) => ({
    url: `${base}/occasions/${o.slug}`,
    lastModified: new Date(),
  }));
  const genres = GENRES.filter((g) => g.slug !== "custom").map((g) => ({
    url: `${base}/genres/${g.slug}`,
    lastModified: new Date(),
  }));
  return [...staticRoutes, ...occasions, ...genres];
}

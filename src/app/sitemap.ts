import type { MetadataRoute } from "next";
import { GENRES, OCCASIONS } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/examples", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/how-it-works", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/occasions", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/reviews", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/track-order", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/legal/terms", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/legal/privacy", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/legal/refunds", priority: 0.2, changeFrequency: "yearly" as const },
  ].map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const occasionRoutes: MetadataRoute.Sitemap = OCCASIONS.map((o) => ({
    url: `${base}/occasions/${o.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const genreRoutes: MetadataRoute.Sitemap = GENRES.filter((g) => g.slug !== "custom").map((g) => ({
    url: `${base}/genres/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...occasionRoutes, ...genreRoutes];
}

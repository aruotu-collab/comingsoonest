import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getBrands, getLaunches } from "@/lib/repo";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://comingsoonest.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/calendar",
    "/calendar/history",
    "/radar",
    "/live",
    "/beauty",
    "/rankings",
    "/search",
    "/brands",
    "/scouts",
    "/intelligence",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "hourly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  const categories: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${siteUrl}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const launches = getLaunches().map((l) => ({
    url: `${siteUrl}/launch/${l.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const brands = getBrands().map((b) => ({
    url: `${siteUrl}/brand/${b.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categories, ...launches, ...brands];
}

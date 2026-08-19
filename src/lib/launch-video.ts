import { prisma } from "@/lib/db";
import { getBrandById } from "@/lib/repo";
import type { Launch } from "@/lib/types";
import { videoUrlForSlug } from "@/data/launch-videos";
import { extractYoutubeId } from "@/lib/youtube";

const HIT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function buildYoutubeQuery(launch: Launch): string {
  const brand = getBrandById(launch.brandId)?.name ?? "Unknown";
  const base = `${brand} ${launch.name}`.replace(/\s+/g, " ").trim();
  // Bias toward product look / official-style coverage without being too narrow
  if (launch.bucket === "wear" || launch.tags.some((t) => /sneaker|trainer/i.test(t))) {
    return `${base} sneakers review`.slice(0, 100);
  }
  if (launch.tags.some((t) => /book/i.test(t)) || launch.subcategory.toLowerCase().includes("book")) {
    return `${base} book`.slice(0, 100);
  }
  if (launch.bucket === "play" || launch.tags.some((t) => /gaming|steam/i.test(t))) {
    return `${base} trailer`.slice(0, 100);
  }
  return `${base} official`.slice(0, 100);
}

async function searchYoutube(query: string): Promise<string | null> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return null;

  const url =
    "https://www.googleapis.com/youtube/v3/search?" +
    new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "1",
      q: query,
      key,
      safeSearch: "moderate",
    });

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.warn("YouTube search failed", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = (await res.json()) as {
    items?: { id?: { videoId?: string } }[];
  };
  const id = data.items?.[0]?.id?.videoId;
  if (!id || !extractYoutubeId(id)) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}

function cacheFresh(updatedAt: Date, hasUrl: boolean): boolean {
  const age = Date.now() - updatedAt.getTime();
  return age < (hasUrl ? HIT_TTL_MS : MISS_TTL_MS);
}

/**
 * Resolve a YouTube URL for a launch:
 * catalogue/curated first, then DB cache, then live YouTube search (if API key set).
 */
export async function resolveLaunchVideo(launch: Launch): Promise<string | null> {
  if (launch.videoUrl && extractYoutubeId(launch.videoUrl)) {
    return launch.videoUrl;
  }

  const curated = videoUrlForSlug(launch.slug);
  if (curated && extractYoutubeId(curated)) return curated;

  try {
    const cached = await prisma.launchVideoCache.findUnique({
      where: { launchId: launch.id },
    });
    if (cached && cacheFresh(cached.updatedAt, Boolean(cached.youtubeUrl))) {
      return cached.youtubeUrl;
    }

    const query = buildYoutubeQuery(launch);
    const found = await searchYoutube(query);

    await prisma.launchVideoCache.upsert({
      where: { launchId: launch.id },
      create: {
        launchId: launch.id,
        slug: launch.slug,
        youtubeUrl: found,
        query,
      },
      update: {
        slug: launch.slug,
        youtubeUrl: found,
        query,
      },
    });

    return found;
  } catch (err) {
    console.warn("resolveLaunchVideo failed", err);
    return null;
  }
}

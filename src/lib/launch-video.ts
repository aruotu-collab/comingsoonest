import { prisma } from "@/lib/db";
import { getBrandById } from "@/lib/repo";
import type { Launch } from "@/lib/types";
import { videoUrlForSlug } from "@/data/launch-videos";
import { extractYoutubeId } from "@/lib/youtube";

const HIT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MISS_TTL_MS = 12 * 60 * 60 * 1000; // retry misses sooner (was 7 days)

function cleanText(s: string): string {
  return s
    .replace(/\//g, " ")
    .replace(/[“”"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build several search queries — first is preferred. */
export function buildYoutubeQueries(launch: Launch): string[] {
  const brand = cleanText(getBrandById(launch.brandId)?.name ?? "");
  const name = cleanText(launch.name);
  const queries: string[] = [];

  // Prefer product name alone when brand is already inside the title
  if (name) queries.push(name);

  const combo = cleanText(`${brand} ${name}`);
  if (combo && combo !== name) queries.push(combo);

  if (launch.bucket === "wear" || launch.tags.some((t) => /sneaker|trainer/i.test(t))) {
    queries.push(`${name} sneakers`);
    queries.push(`${combo} review`);
  } else if (
    launch.tags.some((t) => /book/i.test(t)) ||
    launch.subcategory.toLowerCase().includes("book")
  ) {
    queries.push(`${name} book`);
  } else if (launch.bucket === "play" || launch.tags.some((t) => /gaming|steam/i.test(t))) {
    queries.push(`${name} trailer`);
    queries.push(`${name} gameplay`);
  } else {
    queries.push(`${combo} official`);
  }

  // Dedupe + length cap
  const seen = new Set<string>();
  const out: string[] = [];
  for (const q of queries) {
    const t = q.slice(0, 100);
    const key = t.toLowerCase();
    if (!t || seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out.slice(0, 4);
}

/** @deprecated use buildYoutubeQueries */
export function buildYoutubeQuery(launch: Launch): string {
  return buildYoutubeQueries(launch)[0] || cleanText(launch.name);
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

async function searchYoutubeWithFallback(launch: Launch): Promise<{
  url: string | null;
  query: string;
}> {
  const queries = buildYoutubeQueries(launch);
  for (const query of queries) {
    const url = await searchYoutube(query);
    if (url) return { url, query };
  }
  return { url: null, query: queries[0] || launch.name };
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
    if (cached?.youtubeUrl && cacheFresh(cached.updatedAt, true)) {
      return cached.youtubeUrl;
    }
    // Fresh miss with a known-bad query style → still retry with improved queries
    const staleMiss =
      cached &&
      !cached.youtubeUrl &&
      cacheFresh(cached.updatedAt, false) &&
      !cached.query.includes("/");
    if (staleMiss) {
      return null;
    }

    const { url: found, query } = await searchYoutubeWithFallback(launch);

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

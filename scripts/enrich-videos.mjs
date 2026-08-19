/**
 * Prefetch YouTube matches for upcoming launches (uses YOUTUBE_API_KEY).
 * Each search costs ~100 quota units (default 10k/day ≈ 100 searches).
 *
 *   node --env-file=.env.local scripts/enrich-videos.mjs
 *   node --env-file=.env.local scripts/enrich-videos.mjs --limit=40
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = Number(limitArg?.split("=")[1] || 40);

const key = process.env.YOUTUBE_API_KEY?.trim();
if (!key) {
  console.error("Set YOUTUBE_API_KEY in .env.local");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function searchYoutube(query) {
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
  const res = await fetch(url);
  if (!res.ok) {
    console.warn("search failed", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  const id = data.items?.[0]?.id?.videoId;
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const { default: catalogue } = await import("../src/data/catalogue.generated.json", {
    with: { type: "json" },
  });
  const brands = new Map(catalogue.brands.map((b) => [b.id, b.name]));
  const now = Date.now();
  const candidates = catalogue.launches
    .filter((l) => l.expectedAt && new Date(l.expectedAt).getTime() >= now)
    .sort((a, b) => b.launchScore - a.launchScore || b.watchers - a.watchers)
    .slice(0, LIMIT * 3);

  let done = 0;
  for (const launch of candidates) {
    if (done >= LIMIT) break;
    const existing = await prisma.launchVideoCache.findUnique({
      where: { launchId: launch.id },
    });
    if (existing?.youtubeUrl) continue;
    if (existing && Date.now() - existing.updatedAt.getTime() < 7 * 86400000) continue;

    const brand = brands.get(launch.brandId) || "Unknown";
    const query = `${brand} ${launch.name}`.replace(/\s+/g, " ").trim().slice(0, 100);
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
    done++;
    console.log(
      `${done}/${LIMIT}`,
      found ? "HIT" : "MISS",
      launch.slug,
      found || ""
    );
    await sleep(250);
  }
  console.log(`Enriched ${done} launches`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

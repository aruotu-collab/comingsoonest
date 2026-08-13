import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import type { AlertIntensity, Watch, WatchPrefs, WatchRule } from "@/lib/types";
import { DEFAULT_WATCH_PREFS } from "@/lib/types";

export async function getWatches(): Promise<Watch[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.watch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((w) => ({
    launchId: w.launchId,
    intensity: w.intensity as AlertIntensity,
    prefs: { ...DEFAULT_WATCH_PREFS, ...(w.prefs as Partial<WatchPrefs>) },
    createdAt: w.createdAt.toISOString(),
  }));
}

export async function getWatchRules(): Promise<WatchRule[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.watchRule.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    brandId: r.brandId ?? undefined,
    bucket: (r.bucket as WatchRule["bucket"]) ?? undefined,
    query: r.query ?? undefined,
  }));
}

export async function getProfile() {
  const user = await getSessionUser();
  return {
    name: user?.name || "James",
    location: "SW1",
    interests: ["Fragrance", "Tech", "Fashion", "Family"],
    birthday: "2000-10-04",
    email: user?.email ?? null,
  };
}

export async function isWatching(launchId: string): Promise<boolean> {
  const watches = await getWatches();
  return watches.some((w) => w.launchId === launchId);
}

export { DEFAULT_WATCH_PREFS };
export type { AlertIntensity, WatchPrefs };

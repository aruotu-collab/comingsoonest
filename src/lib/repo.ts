import {
  brands as seedBrands,
  changeEvents,
  csIndex,
  historicalLaunches,
  launches as seedLaunches,
} from "@/data/seed";
import {
  catalogueBrands,
  catalogueLaunches,
} from "@/data/catalogue.generated";
import type {
  Brand,
  CategoryBucket,
  HistoricalLaunch,
  Launch,
  LaunchStatus,
} from "@/lib/types";
import { addDays, format, isSameDay, parseISO, startOfDay } from "date-fns";

function mergeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of secondary) map.set(item.id, item);
  for (const item of primary) map.set(item.id, item);
  return [...map.values()];
}

function mergeLaunches(seed: Launch[], catalogue: Launch[]): Launch[] {
  const bySlug = new Map<string, Launch>();
  for (const l of seed) bySlug.set(l.slug, l);
  for (const l of catalogue) {
    if (!bySlug.has(l.slug)) bySlug.set(l.slug, l);
  }
  return [...bySlug.values()];
}

const brands = mergeById(seedBrands, catalogueBrands);
const launches = mergeLaunches(seedLaunches, catalogueLaunches);

export function getBrands(): Brand[] {
  return brands;
}

export function getBrand(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find((b) => b.id === id);
}

export function getLaunches(opts?: {
  bucket?: CategoryBucket;
  status?: LaunchStatus;
  includeHistorical?: boolean;
}): Launch[] {
  let list = launches.filter((l) => !l.historical);
  if (opts?.bucket) list = list.filter((l) => l.bucket === opts.bucket);
  if (opts?.status) list = list.filter((l) => l.status === opts.status);
  return list;
}

export function getLaunch(slug: string): Launch | undefined {
  return launches.find((l) => l.slug === slug);
}

export function getLaunchById(id: string): Launch | undefined {
  return launches.find((l) => l.id === id);
}

export function brandName(launch: Launch): string {
  return getBrandById(launch.brandId)?.name ?? "Unknown";
}

export function pulseMetrics() {
  const active = getLaunches();
  const week = addDays(new Date(), 7);
  const launchingThisWeek = active.filter((l) => {
    if (!l.expectedAt) return false;
    const d = parseISO(l.expectedAt);
    return d >= startOfDay(new Date()) && d <= week;
  }).length;
  return {
    tracked: active.length,
    launchingThisWeek,
    datesChangedToday: Math.min(24, Math.round(active.length / 40)),
    gainingMomentum: active.filter((l) => l.momentum7d >= 20).length,
    likelySellOut: active.filter((l) => l.dropRisk >= 60).length,
    estimatedInterest: `${Math.round(active.reduce((s, l) => s + l.watchers, 0) / 1000)}k`,
    detectedToday: changeEvents.filter((e) => e.type === "detected").length,
  };
}

export function mostAnticipated(limit = 6): Launch[] {
  return [...getLaunches()]
    .sort((a, b) => b.launchScore - a.launchScore || b.watchers - a.watchers)
    .slice(0, limit);
}

export function justDetected(limit = 6): Launch[] {
  return getLaunches()
    .filter((l) => l.status === "detected" || l.status === "rumoured")
    .sort((a, b) => b.watchersToday - a.watchersToday)
    .slice(0, limit);
}

export function droppingSoon(limit = 6): Launch[] {
  return getLaunches()
    .filter((l) => l.expectedAt)
    .sort((a, b) => {
      const at = a.expectedAt ? new Date(a.expectedAt).getTime() : Infinity;
      const bt = b.expectedAt ? new Date(b.expectedAt).getTime() : Infinity;
      return at - bt;
    })
    .slice(0, limit);
}

export function fastestRising(limit = 6): Launch[] {
  return [...getLaunches()]
    .sort((a, b) => b.momentum7d - a.momentum7d)
    .slice(0, limit);
}

export function underTheRadar(limit = 6): Launch[] {
  return getLaunches()
    .filter((l) => l.underTheRadar || (l.launchScore < 75 && l.momentum7d > 30))
    .sort((a, b) => b.momentum7d - a.momentum7d)
    .slice(0, limit);
}

export function dontBuyYet(): Launch[] {
  return getLaunches()
    .filter((l) => l.successorOf || (l.confidence < 70 && l.status !== "live"))
    .slice(0, 6);
}

export function openingNearYou(): Launch[] {
  return getLaunches()
    .filter((l) => typeof l.nearMiles === "number")
    .sort((a, b) => (a.nearMiles ?? 99) - (b.nearMiles ?? 99));
}

export function liveLaunches(): Launch[] {
  return getLaunches().filter((l) => l.status === "live" || l.status === "dropping");
}

export function getChangeEvents() {
  return [...changeEvents].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}

export function getCsIndex() {
  return csIndex;
}

export function fragranceHeat() {
  return getBrands()
    .filter((b) => typeof b.categoryHeat === "number")
    .sort((a, b) => (b.categoryHeat ?? 0) - (a.categoryHeat ?? 0))
    .slice(0, 8);
}

export function launchesForDay(date: Date): Launch[] {
  return getLaunches().filter((l) => {
    if (!l.expectedAt) return false;
    return isSameDay(parseISO(l.expectedAt), date);
  });
}

export function historyForDay(date: Date): HistoricalLaunch[] {
  return historicalLaunches.filter((h) =>
    isSameDay(parseISO(h.launchedAt), date)
  );
}

export function calendarDays(span = 21) {
  const start = startOfDay(new Date());
  return Array.from({ length: span }, (_, i) => {
    const date = addDays(start, i);
    return {
      key: format(date, "yyyy-MM-dd"),
      date,
      label:
        i === 0
          ? "Today"
          : i === 1
            ? "Tomorrow"
            : format(date, "EEE d MMM"),
      launches: launchesForDay(date),
      history: historyForDay(date),
    };
  });
}

export function yearHeatmap() {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((month, i) => {
    const weight = getLaunches().filter((l) => {
      if (!l.expectedAt) return false;
      return parseISO(l.expectedAt).getMonth() === i;
    }).length;
    return { month, weight: Math.min(12, weight), hot: weight >= 8 };
  });
}

export function scoreBand(score: number): string {
  if (score >= 90) return "Major launch";
  if (score >= 80) return "High interest";
  if (score >= 65) return "Worth watching";
  return "Early signal";
}

export function searchLaunches(q: string): Launch[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return getLaunches().filter((l) => {
    const brand = brandName(l).toLowerCase();
    return (
      l.name.toLowerCase().includes(query) ||
      brand.includes(query) ||
      l.tags.some((t) => t.includes(query)) ||
      l.subcategory.toLowerCase().includes(query) ||
      l.summary.toLowerCase().includes(query)
    );
  });
}

export function launchesByBrand(brandId: string): Launch[] {
  return getLaunches().filter((l) => l.brandId === brandId);
}

export function totalWatchers(): number {
  return getLaunches().reduce((sum, l) => sum + l.watchers, 0);
}

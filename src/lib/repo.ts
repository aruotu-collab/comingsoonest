import {
  brands,
  changeEvents,
  csIndex,
  historicalLaunches,
  launches,
} from "@/data/seed";
import type {
  Brand,
  CategoryBucket,
  HistoricalLaunch,
  Launch,
  LaunchStatus,
} from "@/lib/types";
import { addDays, format, isSameDay, parseISO, startOfDay } from "date-fns";

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
  const week = active.filter((l) => {
    if (!l.expectedAt) return false;
    const d = parseISO(l.expectedAt);
    const now = new Date();
    return d >= now && d <= addDays(now, 7);
  });
  return {
    tracked: 18421,
    launchingThisWeek: week.length || 12,
    datesChangedToday: 137,
    gainingMomentum: active.filter((l) => l.momentum7d >= 20).length,
    likelySellOut: active.filter((l) => l.dropRisk >= 80).length,
    estimatedInterest: "£4.8m",
    detectedToday: 183,
  };
}

export function mostAnticipated(limit = 6): Launch[] {
  return [...getLaunches()].sort((a, b) => b.launchScore - a.launchScore).slice(0, limit);
}

export function justDetected(limit = 6): Launch[] {
  return getLaunches()
    .filter((l) => l.status === "detected" || l.status === "rumoured")
    .sort((a, b) => b.momentum7d - a.momentum7d)
    .slice(0, limit);
}

export function droppingSoon(limit = 6): Launch[] {
  return getLaunches()
    .filter((l) => l.status === "dropping" || l.dropRisk >= 85)
    .sort((a, b) => b.dropRisk - a.dropRisk)
    .slice(0, limit);
}

export function fastestRising(limit = 6): Launch[] {
  return [...getLaunches()].sort((a, b) => b.momentum7d - a.momentum7d).slice(0, limit);
}

export function underTheRadar(limit = 6): Launch[] {
  return getLaunches().filter((l) => l.underTheRadar).slice(0, limit);
}

export function dontBuyYet(): Launch[] {
  return getLaunches().filter((l) => l.successorOf || l.tags.includes("should-wait"));
}

export function openingNearYou(): Launch[] {
  return getLaunches().filter((l) => typeof l.nearMiles === "number");
}

export function liveLaunches(): Launch[] {
  return getLaunches().filter((l) => l.status === "live" || l.status === "sold_out");
}

export function getChangeEvents() {
  return [...changeEvents].sort(
    (a, b) => parseISO(b.at).getTime() - parseISO(a.at).getTime()
  );
}

export function getCsIndex() {
  return csIndex;
}

export function fragranceHeat() {
  return brands
    .filter((b) => b.categoryHeat && ["b-dior", "b-tomford", "b-kayali", "b-creed", "b-jp", "b-chanel"].includes(b.id))
    .sort((a, b) => (b.categoryHeat ?? 0) - (a.categoryHeat ?? 0));
}

export function launchesForDay(date: Date): Launch[] {
  return getLaunches().filter((l) => {
    if (!l.expectedAt) return false;
    return isSameDay(parseISO(l.expectedAt), date);
  });
}

export function historyForDay(date: Date): HistoricalLaunch[] {
  return historicalLaunches.filter((h) => {
    const d = parseISO(h.launchedAt);
    return d.getUTCMonth() === date.getMonth() && d.getUTCDate() === date.getDate();
  });
}

export function calendarDays(span = 21) {
  const start = startOfDay(new Date());
  return Array.from({ length: span }, (_, i) => {
    const date = addDays(start, i);
    const dayLaunches = launchesForDay(date);
    return {
      date,
      key: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE d MMM"),
      launches: dayLaunches,
      count: dayLaunches.length,
      history: historyForDay(date),
    };
  });
}

export function yearHeatmap() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weights = [5, 4, 7, 5, 8, 6, 3, 5, 10, 9, 8, 4];
  return months.map((m, i) => ({ month: m, weight: weights[i], hot: weights[i] >= 9 }));
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

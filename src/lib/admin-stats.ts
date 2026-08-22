import { prisma } from "@/lib/db";
import { getLaunchById } from "@/lib/repo";

function sinceDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function topCounts(
  rows: { key: string | null }[],
  limit = 15
): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const k = (row.key || "(unknown)").slice(0, 200);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getAdminStats() {
  const now = new Date();
  const day1 = sinceDays(1);
  const day7 = sinceDays(7);
  const day30 = sinceDays(30);

  const [
    members,
    watches,
    activeSessions,
    pageviewsAll,
    pageviews7d,
    pageviews1d,
    clicksAll,
    clicks7d,
    visitors7d,
    recentMembers,
    recentEvents,
    paths7d,
    clicks7dRows,
    ips7d,
    countries7d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.watch.count(),
    prisma.session.count({ where: { expiresAt: { gt: now } } }),
    prisma.analyticsEvent.count({ where: { type: "pageview" } }),
    prisma.analyticsEvent.count({
      where: { type: "pageview", createdAt: { gte: day7 } },
    }),
    prisma.analyticsEvent.count({
      where: { type: "pageview", createdAt: { gte: day1 } },
    }),
    prisma.analyticsEvent.count({ where: { type: "click" } }),
    prisma.analyticsEvent.count({
      where: { type: "click", createdAt: { gte: day7 } },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: day7 }, visitorId: { not: null } },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        email: true,
        createdAt: true,
        _count: { select: { watches: true } },
      },
    }),
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        type: true,
        path: true,
        label: true,
        href: true,
        ip: true,
        country: true,
        visitorId: true,
        createdAt: true,
      },
    }),
    prisma.analyticsEvent.findMany({
      where: { type: "pageview", createdAt: { gte: day7 } },
      select: { path: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { type: "click", createdAt: { gte: day7 } },
      select: { label: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: day7 }, ip: { not: null } },
      select: { ip: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: day7 }, country: { not: null } },
      select: { country: true },
    }),
  ]);

  const topPaths = topCounts(
    paths7d.map((r) => ({ key: r.path.split("?")[0] })),
    20
  );
  const topClicks = topCounts(
    clicks7dRows.map((r) => ({ key: r.label })),
    20
  );
  const topIps = topCounts(
    ips7d.map((r) => ({ key: r.ip })),
    25
  );
  const topCountries = topCounts(
    countries7d.map((r) => ({ key: r.country })),
    15
  );

  const launchPaths = topPaths.filter((p) => p.key.startsWith("/launch/"));
  const topLaunches = launchPaths.slice(0, 10).map((p) => {
    const slug = p.key.replace("/launch/", "");
    return { ...p, slug };
  });

  // Most-watched launches (from Watch table)
  const watchGroups = await prisma.watch.groupBy({
    by: ["launchId"],
    _count: { launchId: true },
    orderBy: { _count: { launchId: "desc" } },
    take: 10,
  });
  const topWatched = watchGroups.map((w) => {
    const launch = getLaunchById(w.launchId);
    return {
      launchId: w.launchId,
      count: w._count.launchId,
      name: launch ? `${launch.name}` : w.launchId,
      slug: launch?.slug,
    };
  });

  const members30d = await prisma.user.count({
    where: { createdAt: { gte: day30 } },
  });

  return {
    members,
    members30d,
    watches,
    activeSessions,
    pageviewsAll,
    pageviews7d,
    pageviews1d,
    clicksAll,
    clicks7d,
    uniqueVisitors7d: visitors7d.length,
    recentMembers,
    recentEvents,
    topPaths,
    topClicks,
    topIps,
    topCountries,
    topLaunches,
    topWatched,
  };
}

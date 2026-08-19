import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { LaunchCard } from "@/components/LaunchCard";
import { Pagination } from "@/components/Pagination";
import { getCategory, launchesForCategory } from "@/lib/categories";
import { pageHref, paginate, parsePage } from "@/lib/pagination";
import { getProfile, getWatches } from "@/lib/watches";

function sortLaunches<T extends { launchScore: number; expectedAt?: string; watchers: number }>(
  list: T[]
) {
  return [...list].sort((a, b) => {
    const at = a.expectedAt ? new Date(a.expectedAt).getTime() : Number.POSITIVE_INFINITY;
    const bt = b.expectedAt ? new Date(b.expectedAt).getTime() : Number.POSITIVE_INFINITY;
    if (at !== bt) return at - bt;
    return b.launchScore - a.launchScore || b.watchers - a.watchers;
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageRaw } = await searchParams;
  const category = getCategory(slug);
  if (!category) notFound();

  const all = sortLaunches(launchesForCategory(slug));
  const pager = paginate(all, parsePage(pageRaw));
  const watches = await getWatches();
  const profile = await getProfile();
  const ids = new Set(watches.map((w) => w.launchId));
  const basePath = `/category/${slug}`;

  return (
    <AppShell>
      <div className="mb-4 text-sm text-[var(--muted)]">
        Discover / {category.label}
      </div>

      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Category · Coming up
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          {category.label}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          {pager.total} launch{pager.total === 1 ? "" : "es"} tracked
          {pager.total > 0 && (
            <>
              {" "}
              · showing {pager.from}–{pager.to}
            </>
          )}
        </p>
      </section>

      {pager.total === 0 ? (
        <section className="panel rounded-2xl p-8 text-center text-[var(--muted)]">
          Nothing dated here yet — watch Discover for new signals.
        </section>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {pager.items.map((l) => (
              <LaunchCard
                key={l.id}
                launch={l}
                watching={ids.has(l.id)}
                hasSession={Boolean(profile.email)}
                emphasizeCountdown
              />
            ))}
          </div>
          <Pagination
            page={pager.page}
            totalPages={pager.totalPages}
            hrefForPage={(p) => pageHref(basePath, {}, p)}
          />
        </>
      )}
    </AppShell>
  );
}

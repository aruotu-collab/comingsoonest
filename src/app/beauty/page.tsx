import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { LaunchCard } from "@/components/LaunchCard";
import { Pagination } from "@/components/Pagination";
import { pageHref, paginate, parsePage } from "@/lib/pagination";
import { fragranceHeat, getLaunches } from "@/lib/repo";
import { getProfile, getWatches } from "@/lib/watches";

export default async function BeautyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageRaw } = await searchParams;
  const watches = await getWatches();
  const profile = await getProfile();
  const ids = new Set(watches.map((w) => w.launchId));
  const all = [...getLaunches({ bucket: "beauty" })].sort(
    (a, b) => b.launchScore - a.launchScore
  );
  const pager = paginate(all, parsePage(pageRaw));
  const heat = fragranceHeat();

  return (
    <AppShell>
      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Beauty · Category radar
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Fragrance Radar
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          {pager.total} upcoming
          {pager.total > 0 && (
            <>
              {" "}
              · showing {pager.from}–{pager.to}
            </>
          )}
        </p>
      </section>

      <section className="panel mb-6 rounded-2xl p-5">
        <h2 className="mb-4 text-xs uppercase tracking-[0.16em] text-[var(--hot)]">
          Fragrance heat
        </h2>
        <ul className="space-y-3">
          {heat.map((b) => (
            <li key={b.id}>
              <Link href={`/brand/${b.slug}`} className="block">
                <div className="mb-1 flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span>{b.categoryHeat}</span>
                </div>
                <div className="score-bar rounded-full">
                  <span style={{ width: `${b.categoryHeat}%` }} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {pager.items.map((l) => (
          <LaunchCard
            key={l.id}
            launch={l}
            watching={ids.has(l.id)}
            hasSession={Boolean(profile.email)}
          />
        ))}
      </div>

      <Pagination
        page={pager.page}
        totalPages={pager.totalPages}
        hrefForPage={(p) => pageHref("/beauty", {}, p)}
      />
    </AppShell>
  );
}

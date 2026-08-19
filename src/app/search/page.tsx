import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { LaunchCard } from "@/components/LaunchCard";
import { Pagination } from "@/components/Pagination";
import { pageHref, paginate, parsePage } from "@/lib/pagination";
import { searchLaunches } from "@/lib/repo";
import { getProfile, getWatches } from "@/lib/watches";

const examples = [
  "new men's fragrances",
  "restaurants opening near me",
  "next Samsung phone",
  "LEGO sets",
  "what should I wait for",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageRaw } = await searchParams;
  const all = searchLaunches(q);
  const pager = paginate(all, parsePage(pageRaw));
  const watches = await getWatches();
  const profile = await getProfile();
  const ids = new Set(watches.map((w) => w.launchId));

  return (
    <AppShell>
      <section className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          What’s coming?
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Future-intent search — not “search products…”. AI layer can sit above
          this structured index later.
        </p>
        <form className="mt-4 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="new vanilla fragrance over £100…"
            className="flex-1 rounded-full border border-[var(--line)] bg-white/5 px-4 py-2.5 outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#061018]"
          >
            Search
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {examples.map((e) => (
            <Link
              key={e}
              href={`/search?q=${encodeURIComponent(e)}`}
              className="rounded-full bg-white/5 px-2.5 py-1 text-[var(--muted)] hover:text-[var(--text)]"
            >
              {e}
            </Link>
          ))}
        </div>
      </section>

      {q && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          {pager.total} signals for “{q}”
          {pager.total > 0 && (
            <>
              {" "}
              · showing {pager.from}–{pager.to}
            </>
          )}
        </p>
      )}

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

      {q && pager.total > 0 && (
        <Pagination
          page={pager.page}
          totalPages={pager.totalPages}
          hrefForPage={(p) => pageHref("/search", { q }, p)}
        />
      )}
    </AppShell>
  );
}

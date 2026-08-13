import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { historicalLaunches } from "@/data/seed";
import { getProfile } from "@/lib/watches";

export default async function HistoryPage() {
  const profile = await getProfile();
  const byYear = [...historicalLaunches].sort((a, b) =>
    b.launchedAt.localeCompare(a.launchedAt)
  );

  return (
    <AppShell active="/calendar">
      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Time travel · Then / Next
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Launch history
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          What launched on this date before — and what happens next. History
          becomes intelligence.
        </p>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <section className="panel rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl">THEN / NEXT</h2>
          <p className="mt-3 text-sm">
            <span className="text-[var(--muted)]">THEN</span> — Iconic fragrance
            moments and console eras live in the archive.
          </p>
          <p className="mt-2 text-sm">
            <span className="text-[var(--accent)]">NEXT</span> — Their successors
            appear on{" "}
            <Link href="/calendar" className="text-[var(--accent)]">
              Scroll the Future
            </Link>
            .
          </p>
        </section>
        <section className="panel rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Your birthday in launch history
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Birthday on file: {profile.birthday ?? "Add in profile"}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>Notable games, fragrances, films, and tech across decades</li>
            <li>Shareable “launched on my birthday” cards (Plus growth loop)</li>
          </ul>
        </section>
      </div>

      <section className="panel rounded-2xl p-5">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl">
          Archive
        </h2>
        <ul className="space-y-3">
          {byYear.map((h) => (
            <li
              key={h.id}
              className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] pb-3"
            >
              <div>
                <div className="font-medium">
                  {h.brand} — {h.name}
                </div>
                <div className="text-sm text-[var(--muted)]">{h.note}</div>
              </div>
              <time className="text-sm text-[var(--accent)]">{h.launchedAt}</time>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Historical pattern tip: many fragrance houses cluster launches in
          September — used later for prediction engine.
        </p>
      </section>
    </AppShell>
  );
}

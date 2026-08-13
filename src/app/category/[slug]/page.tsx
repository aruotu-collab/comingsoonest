import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { LaunchCard } from "@/components/LaunchCard";
import { getCategory, launchesForCategory } from "@/lib/categories";
import { getProfile, getWatches } from "@/lib/watches";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const launches = launchesForCategory(slug);
  const watches = await getWatches();
  const profile = await getProfile();
  const ids = new Set(watches.map((w) => w.launchId));

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
          {launches.length} launch{launches.length === 1 ? "" : "es"} tracked in
          this vertical.
        </p>
      </section>

      {launches.length === 0 ? (
        <section className="panel rounded-2xl p-8 text-center text-[var(--muted)]">
          Nothing dated here yet — watch Discover for new signals.
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {launches.map((l) => (
            <LaunchCard
              key={l.id}
              launch={l}
              watching={ids.has(l.id)}
              hasSession={Boolean(profile.email)}
              emphasizeCountdown
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { LaunchCard } from "@/components/LaunchCard";
import { fragranceHeat, getLaunches } from "@/lib/repo";
import { getWatches } from "@/lib/watches";

export default async function BeautyPage() {
  const watches = await getWatches();
  const ids = new Set(watches.map((w) => w.launchId));
  const fragrances = getLaunches({ bucket: "beauty" });
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
          {fragrances.length} upcoming · dates confirmed · launching within 7 days —
          demo vertical from the strategy thread.
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
        {fragrances.map((l) => (
          <LaunchCard key={l.id} launch={l} watching={ids.has(l.id)} />
        ))}
      </div>
    </AppShell>
  );
}

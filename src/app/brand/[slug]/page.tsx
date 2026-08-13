import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { LaunchCard } from "@/components/LaunchCard";
import { getBrand, launchesByBrand } from "@/lib/repo";
import { getProfile, getWatches } from "@/lib/watches";
import { WatchRuleForm } from "@/components/WatchRuleForm";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();
  const launches = launchesByBrand(brand.id);
  const watches = await getWatches();
  const profile = await getProfile();
  const ids = new Set(watches.map((w) => w.launchId));

  return (
    <AppShell>
      <section className="panel mb-6 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Brand · Follow before launch
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          {brand.name}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          {brand.followers.toLocaleString()} followers · receive signals for new
          launches, early access, limited editions
        </p>
        <div className="mt-4">
          <WatchRuleForm
            brandId={brand.id}
            brandName={brand.name}
            bucket={launches[0]?.bucket ?? "beauty"}
          />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {launches.map((l) => (
          <LaunchCard
            key={l.id}
            launch={l}
            watching={ids.has(l.id)}
            hasSession={Boolean(profile.email)}
          />
        ))}
      </div>
    </AppShell>
  );
}

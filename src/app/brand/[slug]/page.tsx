import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { LaunchCard } from "@/components/LaunchCard";
import { Pagination } from "@/components/Pagination";
import { WatchRuleForm } from "@/components/WatchRuleForm";
import { pageHref, paginate, parsePage } from "@/lib/pagination";
import { getBrand, launchesByBrand } from "@/lib/repo";
import { getProfile, getWatches } from "@/lib/watches";

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageRaw } = await searchParams;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const all = [...launchesByBrand(brand.id)].sort((a, b) => {
    const at = a.expectedAt ? new Date(a.expectedAt).getTime() : Number.POSITIVE_INFINITY;
    const bt = b.expectedAt ? new Date(b.expectedAt).getTime() : Number.POSITIVE_INFINITY;
    if (at !== bt) return at - bt;
    return b.launchScore - a.launchScore;
  });
  const pager = paginate(all, parsePage(pageRaw));
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
          {brand.followers.toLocaleString()} followers · {pager.total} launch
          {pager.total === 1 ? "" : "es"}
          {pager.total > 0 && <> · showing {pager.from}–{pager.to}</>}
        </p>
        <div className="mt-4">
          <WatchRuleForm
            brandId={brand.id}
            brandName={brand.name}
            bucket={all[0]?.bucket ?? "beauty"}
          />
        </div>
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
        hrefForPage={(p) => pageHref(`/brand/${slug}`, {}, p)}
      />
    </AppShell>
  );
}

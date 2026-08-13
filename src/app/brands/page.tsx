import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getBrands, launchesByBrand } from "@/lib/repo";

export default async function BrandsPage() {
  const brands = getBrands();

  return (
    <AppShell>
      <section className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Brands</h1>
        <p className="mt-2 text-[var(--muted)]">
          Follow brands before launch. Claim a launch. Plug into people already
          watching your category.
        </p>
        <Link
          href="/brands/claim"
          className="mt-4 inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-[#061018]"
        >
          Are you launching something?
        </Link>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => {
          const count = launchesByBrand(b.id).length;
          return (
            <Link
              key={b.id}
              href={`/brand/${b.slug}`}
              className="panel rounded-2xl p-4 hover:border-[var(--accent)]"
            >
              <div className="font-[family-name:var(--font-display)] text-xl">
                {b.name}
              </div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                {b.followers.toLocaleString()} followers · {count} tracked launches
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

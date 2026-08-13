import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  brandName,
  fastestRising,
  mostAnticipated,
  underTheRadar,
  droppingSoon,
} from "@/lib/repo";

export default async function RankingsPage() {
  const boards = [
    ["Most anticipated", mostAnticipated(8)],
    ["Fastest rising", fastestRising(8)],
    ["Drop risk leaders", droppingSoon(8)],
    ["Under the radar", underTheRadar(8)],
  ] as const;

  return (
    <AppShell>
      <section className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Rankings</h1>
        <p className="mt-2 text-[var(--muted)]">
          Brands reshare these. Organic acquisition machine.
        </p>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {boards.map(([title, list]) => (
          <section key={title} className="panel rounded-2xl p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl">{title}</h2>
            <ol className="mt-4 space-y-3">
              {list.map((l, i) => (
                <li key={l.id} className="flex gap-3 text-sm">
                  <span className="w-6 text-[var(--muted)]">{i + 1}</span>
                  <Link href={`/launch/${l.slug}`} className="flex-1 hover:text-[var(--accent)]">
                    <div className="font-medium">
                      {brandName(l)} — {l.name}
                    </div>
                    <div className="text-[var(--muted)]">
                      {l.watchers.toLocaleString()} watching · Launch {l.launchScore}
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </AppShell>
  );
}

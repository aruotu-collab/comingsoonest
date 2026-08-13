import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getLaunchById, brandName } from "@/lib/repo";
import { getProfile, getWatches } from "@/lib/watches";
import { addDays, isBefore, parseISO } from "date-fns";

export default async function MyFuturePage() {
  const watches = await getWatches();
  const profile = await getProfile();
  const items = watches
    .map((w) => getLaunchById(w.launchId))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  const now = new Date();
  const in7 = addDays(now, 7);
  const in30 = addDays(now, 30);

  const next7 = items.filter(
    (l) => l.expectedAt && isBefore(parseISO(l.expectedAt), in7) && !isBefore(parseISO(l.expectedAt), now)
  );
  const next30 = items.filter((l) => {
    if (!l.expectedAt) return false;
    const d = parseISO(l.expectedAt);
    return !isBefore(d, in7) && isBefore(d, in30);
  });
  const unknown = items.filter((l) => !l.expectedAt || l.regions.some((r) => r.dateLabel.toLowerCase().includes("not confirmed")));
  const waitingPrice = items.filter((l) => !l.expectedPrice);
  const waitingUk = items.filter((l) =>
    l.regions.some((r) => r.region.includes("United Kingdom") && r.confidence < 80)
  );
  const waitingSample = items.filter((l) => !l.sampleAvailable && l.bucket === "beauty");
  const waitingPreorder = items.filter((l) => !l.preorderUrl && l.status !== "live");

  const buckets = [
    ["Next 7 days", next7],
    ["Next 30 days", next30],
    ["Date unknown / unclear", unknown],
    ["Waiting for price", waitingPrice],
    ["Waiting for UK release", waitingUk],
    ["Waiting for sample", waitingSample],
    ["Waiting for preorder", waitingPreorder],
  ] as const;

  return (
    <AppShell active="/my-future">
      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          My Future · {profile.name} · {profile.location}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Your personal launch calendar
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Since your last visit mindset — what changed, what’s waiting, when to act.
        </p>
      </section>

      <section className="panel mb-6 rounded-2xl p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          What changed
        </h2>
        <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <li>{items.length} launches on your graph</li>
          <li>{next7.length} launching within 7 days</li>
          <li>{waitingUk.length} waiting on UK clarity</li>
          <li>{waitingSample.length} sample opportunities to arm</li>
        </ul>
        <Link href="/live" className="mt-3 inline-block text-sm text-[var(--accent)]">
          Open live tape →
        </Link>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {buckets.map(([title, list]) => (
          <section key={title} className="panel rounded-2xl p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-lg">{title}</h2>
              <span className="text-[var(--accent)]">{list.length}</span>
            </div>
            {list.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted)]">Nothing in this bucket.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {list.map((l) => (
                  <li key={l.id}>
                    <Link href={`/launch/${l.slug}`} className="hover:text-[var(--accent)]">
                      {brandName(l)} — {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </AppShell>
  );
}

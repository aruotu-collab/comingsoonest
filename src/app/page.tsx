import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Countdown } from "@/components/Countdown";
import { LaunchCard } from "@/components/LaunchCard";
import { LiveTape } from "@/components/LiveTape";
import {
  dontBuyYet,
  fastestRising,
  getChangeEvents,
  getCsIndex,
  justDetected,
  mostAnticipated,
  droppingSoon,
  pulseMetrics,
  underTheRadar,
} from "@/lib/repo";
import { getProfile, getWatches } from "@/lib/watches";
import { addDays, format } from "date-fns";

export default async function DiscoverPage() {
  const watches = await getWatches();
  const watchingIds = new Set(watches.map((w) => w.launchId));
  const profile = await getProfile();
  const hasSession = Boolean(profile.email);
  const metrics = pulseMetrics();
  const anticipated = mostAnticipated(3);
  const detected = justDetected(3);
  const dropping = droppingSoon(3);
  const rising = fastestRising(4);
  const radar = underTheRadar(3);
  const wait = dontBuyYet();
  const events = getChangeEvents().slice(0, 8);
  const index = getCsIndex();

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { label: format(d, "EEE"), key: format(d, "yyyy-MM-dd") };
  });

  return (
    <AppShell active="/">
      <section className="rise mb-8">
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
          Next Pulse · Very active
        </p>
        <h1 className="mt-2 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight md:text-6xl">
          Intelligence for what’s next
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          We find it before it launches. We track it until it drops. You never
          miss what matters.
        </p>
      </section>

      <section className="panel mb-8 overflow-hidden rounded-2xl">
        <div className="grid grid-cols-2 gap-px bg-[var(--line)] md:grid-cols-3 lg:grid-cols-6">
          {[
            [metrics.tracked.toLocaleString(), "Launches tracked"],
            [String(metrics.launchingThisWeek), "Launching this week"],
            [String(metrics.datesChangedToday), "Dates changed today"],
            [String(metrics.gainingMomentum), "Gaining momentum"],
            [String(metrics.likelySellOut), "Likely to sell out"],
            [metrics.estimatedInterest, "Est. launch interest"],
          ].map(([value, label]) => (
            <div key={label} className="bg-[var(--bg-panel)] p-4">
              <div className="font-[family-name:var(--font-display)] text-2xl">{value}</div>
              <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
                {label}
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-hidden border-t border-[var(--line)] py-2 text-xs text-[var(--muted)]">
          <div className="ticker inline-block px-4">
            FRAGRANCE ↑ 34% · GAMING ↑ 21% · SNEAKERS ↑ 18% · AI ↑ 12% · +
            {metrics.detectedToday} DETECTED TODAY · BEAUTY HOT · LONDON DEMAND
            ELEVATED · FRAGRANCE ↑ 34% · GAMING ↑ 21% · SNEAKERS ↑ 18% · AI ↑ 12%
          </div>
        </div>
      </section>

      <section className="panel mb-8 rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Good evening, {profile.name}
        </p>
        <p className="mt-2 text-lg">
          {anticipated.length + detected.length} things you’re likely to care
          about are coming.{" "}
          <span className="text-[var(--muted)]">
            {watches.length} on your watchlist · {wait.length} “don’t buy yet”
            signals.
          </span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {profile.interests.map((i) => (
            <span key={i} className="rounded-full bg-white/5 px-2.5 py-1 text-[var(--muted)]">
              {i}
            </span>
          ))}
          <Link href="/my-future" className="text-[var(--accent)]">
            View My Future →
          </Link>
        </div>
      </section>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--hot)]">
            Most anticipated
          </h2>
          {anticipated.map((l) => (
            <LaunchCard
              key={l.id}
              launch={l}
              watching={watchingIds.has(l.id)}
              hasSession={hasSession}
              badge="Most anticipated"
            />
          ))}
        </div>
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            Just detected
          </h2>
          {detected.map((l) => (
            <LaunchCard
              key={l.id}
              launch={l}
              watching={watchingIds.has(l.id)}
              hasSession={hasSession}
              badge="Just detected"
            />
          ))}
        </div>
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--danger)]">
            Drop imminent
          </h2>
          {dropping.map((l) => (
            <LaunchCard
              key={l.id}
              launch={l}
              watching={watchingIds.has(l.id)}
              hasSession={hasSession}
              badge="Drop imminent"
            />
          ))}
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <section className="panel rounded-2xl p-4 lg:col-span-1">
          <h2 className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            This week
          </h2>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {week.map((d, i) => (
              <Link
                key={d.key}
                href="/calendar"
                className="rounded-lg bg-white/5 px-1 py-3 hover:bg-[var(--accent-soft)]"
              >
                <div className="text-[var(--muted)]">{d.label}</div>
                <div className="mt-1 font-[family-name:var(--font-display)] text-lg">
                  {[23, 31, 18, 28, 41, 12, 9][i]}
                </div>
              </Link>
            ))}
          </div>
          <h2 className="mb-2 mt-5 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Coming Soon Index
          </h2>
          <ul className="space-y-2 text-sm">
            {index.map((row) => (
              <li key={row.label} className="flex justify-between">
                <span>{row.label}</span>
                <span className={row.delta >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]"}>
                  {row.delta >= 0 ? "+" : ""}
                  {row.delta}%
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-1">
          <LiveTape events={events} />
        </section>

        <section className="panel rounded-2xl p-4">
          <h2 className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--warn)]">
            Don’t buy yet
          </h2>
          {wait.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No wait signals right now.</p>
          ) : (
            wait.map((l) => (
              <Link
                key={l.id}
                href={`/launch/${l.slug}`}
                className="mb-3 block border-b border-[var(--line)] pb-3 last:mb-0 last:border-0"
              >
                <div className="font-medium">{l.name}</div>
                <div className="text-sm text-[var(--muted)]">
                  Wait — {l.confidence}% · {l.expectedLabel}
                  {l.successorOf ? ` · replaces ${l.successorOf}` : ""}
                </div>
                <div className="mt-1">
                  <Countdown
                    targetAt={l.expectedAt}
                    status={l.status}
                    fallbackLabel={l.expectedLabel}
                    size="sm"
                  />
                </div>
              </Link>
            ))
          )}
          <h2 className="mb-2 mt-5 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Under the radar
          </h2>
          <ul className="space-y-2 text-sm">
            {radar.map((l) => (
              <li key={l.id}>
                <Link href={`/launch/${l.slug}`} className="hover:text-[var(--accent)]">
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mb-2 mt-5 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Fastest rising
          </h2>
          <ul className="space-y-2 text-sm">
            {rising.map((l) => (
              <li key={l.id} className="flex justify-between gap-2">
                <Link href={`/launch/${l.slug}`} className="hover:text-[var(--accent)]">
                  {l.name}
                </Link>
                <span className="text-[var(--ok)]">↑{l.momentum7d}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel rounded-2xl p-5 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl">
          Before you buy, check what’s coming.
        </p>
        <p className="mt-2 text-[var(--muted)]">
          Discovery + verification + anticipation + monitoring + timing +
          availability + personal relevance.
        </p>
      </section>
    </AppShell>
  );
}

import { AppShell } from "@/components/AppShell";
import { LiveTape } from "@/components/LiveTape";
import { getChangeEvents, pulseMetrics } from "@/lib/repo";

export default async function LivePage() {
  const events = getChangeEvents();
  const metrics = pulseMetrics();

  return (
    <AppShell active="/live">
      <section className="mb-6">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Live
          </p>
        </div>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Global launch intelligence
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          There is always something changing — your Bloomberg-style tape.
        </p>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["+183", "Detected today"],
          [String(metrics.datesChangedToday), "Date moves"],
          [String(metrics.gainingMomentum), "Momentum spikes"],
          [String(metrics.likelySellOut), "High drop risk"],
        ].map(([v, l]) => (
          <div key={l} className="panel rounded-2xl p-4">
            <div className="font-[family-name:var(--font-display)] text-2xl">{v}</div>
            <div className="text-xs uppercase tracking-wider text-[var(--muted)]">{l}</div>
          </div>
        ))}
      </div>

      <LiveTape events={events} />
    </AppShell>
  );
}

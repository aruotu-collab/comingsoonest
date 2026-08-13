import { AppShell } from "@/components/AppShell";

export default function IntelligencePage() {
  return (
    <AppShell>
      <section className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          Coming Soon Intelligence
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          B2B layer — while the public sees a launch tracker, you’ve built a
          real-time database of pre-launch consumer intent. Consent & privacy
          first.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          ["Watchlist growth", "+18% WoW"],
          ["Share of anticipation", "#3 in Fragrance"],
          ["Regional demand", "London 2.4× national"],
          ["Purchase intent", "61% want to try"],
          ["Sample demand", "82% sample-first"],
          ["Calendar congestion", "4 high-momentum overlaps"],
        ].map(([k, v]) => (
          <div key={k} className="panel rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
              {k}
            </div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
              {v}
            </div>
          </div>
        ))}
      </div>
      <section className="panel mt-6 rounded-2xl p-5 text-sm text-[var(--muted)]">
        Example: Your fragrance has 32,418 UK watchers. 61% also watch Kayali.
        Launch week overlaps four high-momentum fragrances. Pricing sketches
        from the thread: £199/mo indie → £1,000+/mo brand → enterprise later.
      </section>
    </AppShell>
  );
}

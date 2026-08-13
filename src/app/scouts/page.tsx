import { AppShell } from "@/components/AppShell";

export default function ScoutsPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          Submit a Signal
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Spotted something coming? Scouts help build the database. Reputation
          for accuracy — not meaningless points.
        </p>
        <form className="panel mt-6 space-y-3 rounded-2xl p-5">
          <label className="block text-sm">
            <span className="text-[var(--muted)]">What did you detect?</span>
            <input className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Evidence / link</span>
            <input className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Notes</span>
            <textarea className="mt-1 min-h-24 w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2" />
          </label>
          <button
            type="button"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-[#061018]"
          >
            Submit signal
          </button>
        </form>
        <section className="panel mt-4 rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Top Scouts
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>Ava — 342 signals · 97% accuracy · Top 1% Beauty Scout</li>
            <li>Marcus — 18 first detections · Sneaker lane</li>
            <li>Priya — 210 signals · Tech early warnings</li>
          </ul>
        </section>
      </section>
    </AppShell>
  );
}

import { AppShell } from "@/components/AppShell";

export default function ClaimLaunchPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          Claim a launch
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Don’t build another isolated waitlist. Plug into people already
          watching your category. Official Source badge on approval.
        </p>
        <form className="panel mt-6 space-y-3 rounded-2xl p-5">
          {[
            ["Product name", "text"],
            ["Brand", "text"],
            ["Launch date", "date"],
            ["Territories", "text"],
            ["Pricing", "text"],
            ["Retailers", "text"],
            ["Early-access link", "url"],
            ["Sample / waitlist URL", "url"],
          ].map(([label, type]) => (
            <label key={label} className="block text-sm">
              <span className="text-[var(--muted)]">{label}</span>
              <input
                type={type}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 outline-none focus:border-[var(--accent)]"
              />
            </label>
          ))}
          <button
            type="button"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#061018]"
          >
            Submit for Official Source
          </button>
          <p className="text-xs text-[var(--muted)]">
            Demo form — wire to moderation queue in production.
          </p>
        </form>
      </section>
    </AppShell>
  );
}

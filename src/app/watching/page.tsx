import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { LaunchCard } from "@/components/LaunchCard";
import { RemoveRuleButton } from "@/components/RemoveRuleButton";
import { SignInForm } from "@/components/SignInForm";
import { getLaunchById, getBrandById } from "@/lib/repo";
import { getProfile, getWatchRules, getWatches } from "@/lib/watches";

export default async function WatchingPage() {
  const profile = await getProfile();
  const signedIn = Boolean(profile.email);

  if (!signedIn) {
    return (
      <AppShell active="/watching">
        <section className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Watching · Never miss what’s next
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
            Your future-interest graph
          </h1>
        </section>
        <section className="panel rounded-2xl p-8">
          <SignInForm />
        </section>
      </AppShell>
    );
  }

  const watches = await getWatches();
  const rules = await getWatchRules();
  const launches = watches
    .map((w) => ({ watch: w, launch: getLaunchById(w.launchId) }))
    .filter((x): x is { watch: (typeof watches)[0]; launch: NonNullable<ReturnType<typeof getLaunchById>> } =>
      Boolean(x.launch)
    )
    .sort((a, b) => {
      const at = a.launch.expectedAt ? new Date(a.launch.expectedAt).getTime() : Number.POSITIVE_INFINITY;
      const bt = b.launch.expectedAt ? new Date(b.launch.expectedAt).getTime() : Number.POSITIVE_INFINITY;
      return at - bt;
    });

  return (
    <AppShell active="/watching">
      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Watching · Never miss what’s next
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Your future-interest graph
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Signed in as {profile.email}. Not bookmarks — an agent monitoring the
          market for you.
        </p>
      </section>

      <section className="panel mb-6 rounded-2xl p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Watch rules
        </h2>
        {rules.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            Open a launch and add “Watch everything like this” — brand or
            category rules land here.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rules.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm"
              >
                <span>
                  {r.label}
                  {r.brandId && (
                    <span className="text-[var(--muted)]">
                      {" "}
                      · {getBrandById(r.brandId)?.name}
                    </span>
                  )}
                </span>
                <RemoveRuleButton id={r.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {launches.length === 0 ? (
        <section className="panel rounded-2xl p-8 text-center">
          <p className="text-lg">You’re not watching anything yet.</p>
          <p className="mt-2 text-[var(--muted)]">
            Start on Discover — Watch is the subscription engine.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-[#061018]"
          >
            Discover launches
          </Link>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {launches.map(({ launch, watch }) => (
            <div key={launch.id}>
              <LaunchCard launch={launch} watching hasSession emphasizeCountdown />
              <p className="mt-2 px-1 text-xs text-[var(--muted)]">
                Intensity: {watch.intensity.replaceAll("_", " ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

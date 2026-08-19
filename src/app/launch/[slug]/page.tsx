import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { Countdown } from "@/components/Countdown";
import { ScorePills } from "@/components/ScorePills";
import { ShareButton } from "@/components/ShareButton";
import { WatchButton } from "@/components/WatchButton";
import { formatReleaseDate } from "@/lib/countdown";
import { brandName, getBrandById, getLaunch, scoreBand } from "@/lib/repo";
import { STATUS_LABEL } from "@/lib/types";
import { getProfile, getWatches } from "@/lib/watches";
import { IntensityForm } from "@/components/IntensityForm";
import { WatchRuleForm } from "@/components/WatchRuleForm";

export default async function LaunchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const launch = getLaunch(slug);
  if (!launch) notFound();

  const brand = getBrandById(launch.brandId);
  const releaseDate = formatReleaseDate(launch.expectedAt);
  const watches = await getWatches();
  const profile = await getProfile();
  const watch = watches.find((w) => w.launchId === launch.id);
  const confirmed = launch.sources.filter((s) => s.confirmed).length;
  const signalPct = launch.confidence;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://comingsoonest.com";
  const shareUrl = `${siteUrl.replace(/\/$/, "")}/launch/${launch.slug}`;
  const shareTitle = `${brandName(launch)} — ${launch.name}`;
  const shareText = `Watching this on Coming Soonest: ${shareTitle} (${launch.expectedLabel})`;

  return (
    <AppShell>
      <div className="mb-4 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          Discover
        </Link>{" "}
        / {launch.subcategory}
      </div>

      <section className="panel rise mb-6 rounded-2xl p-5 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--hot)]">
              {STATUS_LABEL[launch.status]} · {scoreBand(launch.launchScore)}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl md:text-5xl">
              {brandName(launch)}
            </h1>
            <p className="mt-1 text-xl text-[var(--muted)]">{launch.name}</p>
            <p className="mt-4 max-w-2xl text-[var(--muted)]">{launch.summary}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <WatchButton
                launchId={launch.id}
                watching={Boolean(watch)}
                hasSession={Boolean(profile.email)}
              />
              <ShareButton
                title={shareTitle}
                text={shareText}
                url={shareUrl}
              />
            </div>
            {launch.status === "live" && launch.buyUrl && (
              <a
                href={launch.buyUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[var(--ok)] px-4 py-2 text-sm font-medium text-[#04140c]"
              >
                Buy now
              </a>
            )}
            {launch.preorderUrl && launch.status !== "live" && (
              <a
                href={launch.preorderUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--ok)] px-4 py-2 text-sm text-[var(--ok)]"
              >
                Preorder
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-black/25 p-4 md:p-5">
          <Countdown
            targetAt={launch.expectedAt}
            status={launch.status}
            fallbackLabel={launch.expectedLabel}
            size="lg"
          />
          <p className="mt-2 text-base font-medium text-[var(--text)]">
            {releaseDate || launch.expectedLabel}
          </p>
          {releaseDate && launch.expectedLabel && launch.expectedLabel !== releaseDate && (
            <p className="mt-1 text-sm text-[var(--muted)]">{launch.expectedLabel}</p>
          )}
        </div>

        <div className="mt-6">
          <ScorePills
            launch={launch.launchScore}
            hype={launch.hype}
            confidence={launch.confidence}
            dropRisk={launch.dropRisk}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Expected", releaseDate || launch.expectedLabel],
            ["Price", launch.expectedPrice ?? "—"],
            ["Watching", launch.watchers.toLocaleString()],
            ["7d momentum", `↑ ${launch.momentum7d}%`],
            ["Joined today", launch.watchersToday.toLocaleString()],
            ["Sizes", launch.sizes?.join(" · ") ?? "—"],
            ["Intent buy", launch.intentBuyPct ? `${launch.intentBuyPct}%` : "—"],
            ["Want sample", launch.intentSamplePct ? `${launch.intentSamplePct}%` : "—"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                {k}
              </div>
              <div className="mt-1 font-medium">{v}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Release intelligence
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Uncertainty is a feature — dates differ by region and retailer.
          </p>
          <ul className="mt-4 space-y-3">
            {launch.regions.map((r) => (
              <li
                key={r.region}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3"
              >
                <div>
                  <div className="font-medium">{r.region}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {r.dateLabel}
                    {r.note ? ` · ${r.note}` : ""}
                  </div>
                </div>
                <div className="text-sm text-[var(--accent)]">
                  Date confidence {r.confidence}%
                </div>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
            Retailers
          </h3>
          <ul className="mt-2 space-y-2 text-sm">
            {launch.retailers.map((r) => (
              <li key={r.name} className="flex justify-between gap-3">
                <span>{r.name}</span>
                <span className="text-[var(--muted)]">{r.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Truth layer
          </h2>
          <p className="mt-2 text-3xl font-[family-name:var(--font-display)] text-[var(--accent)]">
            {signalPct}%
          </p>
          <p className="text-sm text-[var(--muted)]">
            Signal confidence — {confirmed}/{launch.sources.length} sources confirmed
          </p>
          <h3 className="mt-4 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Why we believe this
          </h3>
          <ul className="mt-2 space-y-2 text-sm">
            {launch.sources.map((s) => (
              <li key={s.label} className="flex gap-2">
                <span>{s.confirmed ? "✓" : "○"}</span>
                <span className={s.confirmed ? "" : "text-[var(--muted)]"}>
                  {s.label}
                </span>
              </li>
            ))}
          </ul>

          {launch.dropRisk >= 85 && (
            <div className="mt-5 rounded-xl border border-[rgba(240,93,93,0.35)] bg-[rgba(240,93,93,0.1)] p-3 text-sm">
              High drop risk. Enable instant launch alerts (Must Get).
            </div>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="panel rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Launch timeline
          </h2>
          <ol className="mt-4 space-y-3">
            {[...launch.timeline]
              .sort((a, b) => parseISO(b.at).getTime() - parseISO(a.at).getTime())
              .map((t) => (
                <li key={t.at + t.label} className="flex gap-4 border-l border-[var(--line)] pl-4">
                  <div className="w-28 shrink-0 text-xs text-[var(--muted)]">
                    {format(parseISO(t.at), "d MMM yyyy")}
                  </div>
                  <div>{t.label}</div>
                </li>
              ))}
          </ol>
        </section>

        <section className="panel rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Sample watch
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>🔔 Launch</li>
            <li>🧪 Sample {launch.sampleAvailable ? "· signal live" : ""}</li>
            <li>🏬 In-store tester</li>
            <li>📦 Discovery set</li>
            <li>💷 Price drop</li>
          </ul>
          {brand && (
            <Link
              href={`/brand/${brand.slug}`}
              className="mt-4 inline-block text-sm text-[var(--accent)]"
            >
              Follow {brand.name} →
            </Link>
          )}
        </section>
      </div>

      {watch && (
        <section className="panel mt-4 rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Don’t let me miss this
          </h2>
          <IntensityForm launchId={launch.id} intensity={watch.intensity} />
          <div className="mt-4">
            <WatchRuleForm
              brandId={launch.brandId}
              brandName={brandName(launch)}
              bucket={launch.bucket}
            />
          </div>
        </section>
      )}
    </AppShell>
  );
}

import Link from "next/link";
import type { Launch } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { brandName, scoreBand } from "@/lib/repo";
import { formatReleaseDate } from "@/lib/countdown";
import { Countdown } from "@/components/Countdown";
import { ScorePills } from "@/components/ScorePills";
import { WatchButton } from "@/components/WatchButton";

export function LaunchCard({
  launch,
  watching,
  badge,
  hasSession,
  emphasizeCountdown,
}: {
  launch: Launch;
  watching: boolean;
  badge?: string;
  hasSession?: boolean;
  emphasizeCountdown?: boolean;
}) {
  const releaseDate = formatReleaseDate(launch.expectedAt);

  return (
    <article className="panel rise flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          {badge && (
            <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-[var(--hot)]">
              {badge}
            </div>
          )}
          <Link href={`/launch/${launch.slug}`} className="block">
            <h3 className="font-[family-name:var(--font-display)] text-xl tracking-wide">
              {brandName(launch)}
            </h3>
            <p className="text-[var(--muted)]">{launch.name}</p>
          </Link>
        </div>
        <WatchButton
          launchId={launch.id}
          watching={watching}
          hasSession={hasSession}
          compact
        />
      </div>

      <div
        className={
          emphasizeCountdown ? "w-full rounded-xl bg-black/20 px-3 py-2" : undefined
        }
      >
        <Countdown
          targetAt={launch.expectedAt}
          status={launch.status}
          fallbackLabel={launch.expectedLabel}
          size={emphasizeCountdown ? "md" : "sm"}
        />
        {releaseDate && (
          <p
            className={`mt-1.5 font-medium tracking-wide text-[var(--text)] ${
              emphasizeCountdown ? "text-sm" : "text-xs"
            }`}
          >
            {releaseDate}
          </p>
        )}
      </div>

      <ScorePills
        launch={launch.launchScore}
        hype={launch.hype}
        confidence={launch.confidence}
        dropRisk={launch.dropRisk}
      />

      <p className="line-clamp-2 text-sm text-[var(--muted)]">{launch.summary}</p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
        <span>{STATUS_LABEL[launch.status]}</span>
        <span>{releaseDate || launch.expectedLabel}</span>
        <span>{launch.watchers.toLocaleString()} watching</span>
        <span>↑ {launch.momentum7d}% 7d</span>
        <span>{scoreBand(launch.launchScore)}</span>
        {launch.sponsored && <span className="text-[var(--hot)]">Sponsored</span>}
        {launch.sampleAvailable && <span className="text-[var(--ok)]">Sample signal</span>}
        {typeof launch.nearMiles === "number" && (
          <span>{launch.nearMiles} mi</span>
        )}
      </div>
    </article>
  );
}

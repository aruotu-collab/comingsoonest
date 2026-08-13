export function ScorePills({
  launch,
  dropRisk,
  confidence,
  hype,
}: {
  launch: number;
  hype: number;
  confidence: number;
  dropRisk?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[var(--accent)]">
        LAUNCH {launch}
      </span>
      <span className="rounded-md bg-white/5 px-2 py-1 text-[var(--muted)]">
        HYPE {hype}
      </span>
      <span className="rounded-md bg-white/5 px-2 py-1 text-[var(--muted)]">
        CONFIDENCE {confidence}
      </span>
      {typeof dropRisk === "number" && (
        <span
          className={`rounded-md px-2 py-1 ${
            dropRisk >= 85
              ? "bg-[rgba(240,93,93,0.15)] text-[var(--danger)]"
              : "bg-white/5 text-[var(--muted)]"
          }`}
        >
          DROP RISK {dropRisk}
        </span>
      )}
    </div>
  );
}

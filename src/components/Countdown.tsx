"use client";

import { useEffect, useState } from "react";
import { getCountdown, pad2 } from "@/lib/countdown";

type Size = "sm" | "md" | "lg";

export function Countdown({
  targetAt,
  status,
  fallbackLabel,
  size = "md",
  className = "",
}: {
  targetAt?: string | null;
  status?: string;
  fallbackLabel?: string;
  size?: Size;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = getCountdown(targetAt, now ?? Date.now(), status);

  if (parts.state === "undated") {
    return (
      <span
        className={`text-[var(--muted)] ${size === "sm" ? "text-xs" : "text-sm"} ${className}`}
      >
        {fallbackLabel || "Date TBD"}
      </span>
    );
  }

  if (parts.state === "live") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium text-[var(--live)] ${
          size === "lg" ? "text-lg" : size === "sm" ? "text-xs" : "text-sm"
        } ${className}`}
      >
        <span className="live-dot" />
        Live now
      </span>
    );
  }

  if (parts.state === "past") {
    return (
      <span
        className={`text-[var(--muted)] ${size === "sm" ? "text-xs" : "text-sm"} ${className}`}
      >
        Dropped
      </span>
    );
  }

  const urgent = parts.totalMs < 48 * 60 * 60 * 1000;
  const units =
    parts.days > 0
      ? [
          [parts.days, "d"],
          [parts.hours, "h"],
          [parts.minutes, "m"],
        ]
      : [
          [parts.hours, "h"],
          [parts.minutes, "m"],
          [parts.seconds, "s"],
        ];

  if (size === "sm") {
    const text =
      parts.days > 0
        ? `${parts.days}d ${pad2(parts.hours)}h ${pad2(parts.minutes)}m`
        : `${pad2(parts.hours)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`;
    return (
      <span
        className={`font-mono tabular-nums ${
          urgent ? "text-[var(--hot)]" : "text-[var(--accent)]"
        } ${className}`}
        suppressHydrationWarning
      >
        {now === null ? (fallbackLabel ?? "…") : text}
      </span>
    );
  }

  const box =
    size === "lg"
      ? "min-w-[3.25rem] rounded-xl px-2.5 py-2 text-2xl md:text-3xl"
      : "min-w-[2.5rem] rounded-lg px-2 py-1.5 text-base";

  const labelCls = size === "lg" ? "text-[10px]" : "text-[9px]";

  return (
    <div
      className={`inline-flex flex-col gap-1 ${className}`}
      suppressHydrationWarning
    >
      {size === "lg" && (
        <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          {urgent ? "Drops in" : "Countdown"}
        </span>
      )}
      <div className="flex items-end gap-1.5">
        {now === null
          ? units.map(([, u]) => (
              <div
                key={u}
                className={`${box} bg-white/5 text-center font-[family-name:var(--font-display)] tabular-nums text-[var(--muted)]`}
              >
                —
                <div className={`${labelCls} mt-0.5 uppercase tracking-wider text-[var(--muted)]`}>
                  {u}
                </div>
              </div>
            ))
          : units.map(([value, u]) => (
              <div
                key={u}
                className={`${box} bg-white/5 text-center font-[family-name:var(--font-display)] tabular-nums ${
                  urgent ? "text-[var(--hot)]" : "text-[var(--accent)]"
                }`}
              >
                {pad2(Number(value))}
                <div className={`${labelCls} mt-0.5 uppercase tracking-wider text-[var(--muted)]`}>
                  {u}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

export type CountdownState = "undated" | "upcoming" | "live" | "past";

export type CountdownParts = {
  state: CountdownState;
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function getCountdown(
  targetAt: string | null | undefined,
  now = Date.now(),
  status?: string
): CountdownParts {
  if (status === "live") {
    return {
      state: "live",
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  if (!targetAt) {
    return {
      state: "undated",
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const target = new Date(targetAt).getTime();
  if (Number.isNaN(target)) {
    return {
      state: "undated",
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalMs = target - now;
  if (totalMs <= 0) {
    // Within the last 24h of passing, treat as live-ish; older = past
    const past = -totalMs;
    return {
      state: past < 24 * 60 * 60 * 1000 ? "live" : "past",
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const seconds = Math.floor(totalMs / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return {
    state: "upcoming",
    totalMs,
    days,
    hours,
    minutes,
    seconds: secs,
  };
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Calendar date for UI, e.g. "26 Sept 2026". */
export function formatReleaseDate(targetAt?: string | null): string | null {
  if (!targetAt) return null;
  const d = new Date(targetAt);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}


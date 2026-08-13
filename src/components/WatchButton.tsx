"use client";

import { useTransition } from "react";
import { watchLaunch, unwatchLaunch } from "@/lib/actions";

export function WatchButton({
  launchId,
  watching,
  compact,
}: {
  launchId: string;
  watching: boolean;
  compact?: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (watching) await unwatchLaunch(launchId);
          else await watchLaunch(launchId);
        })
      }
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
        watching
          ? "border border-[var(--accent)] bg-transparent text-[var(--accent)]"
          : "bg-[var(--accent)] text-[#061018] hover:brightness-110"
      } ${compact ? "text-xs" : ""}`}
    >
      {pending ? "…" : watching ? "Watching" : "Watch"}
    </button>
  );
}

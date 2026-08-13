"use client";

import { useTransition } from "react";
import type { AlertIntensity } from "@/lib/types";
import { updateWatchIntensity } from "@/lib/actions";

const levels: { id: AlertIntensity; label: string; desc: string }[] = [
  { id: "relaxed", label: "Relaxed", desc: "Weekly updates" },
  { id: "interested", label: "Interested", desc: "Important changes only" },
  {
    id: "i_want_this",
    label: "I want this",
    desc: "Date + preorder + 24h + launch",
  },
  {
    id: "must_get",
    label: "Must get",
    desc: "Everything + stock + retailer alerts",
  },
];

export function IntensityForm({
  launchId,
  intensity,
}: {
  launchId: string;
  intensity: AlertIntensity;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {levels.map((l) => (
        <button
          key={l.id}
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await updateWatchIntensity(launchId, l.id);
            })
          }
          className={`rounded-xl border px-3 py-3 text-left transition ${
            intensity === l.id
              ? "border-[var(--accent)] bg-[var(--accent-soft)]"
              : "border-[var(--line)] hover:border-[var(--accent)]"
          }`}
        >
          <div className="font-medium">{l.label}</div>
          <div className="text-xs text-[var(--muted)]">{l.desc}</div>
        </button>
      ))}
    </div>
  );
}

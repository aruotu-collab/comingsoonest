"use client";

import { useTransition } from "react";
import { removeWatchRule } from "@/lib/actions";

export function RemoveRuleButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => removeWatchRule(id))}
      className="text-[var(--muted)] hover:text-[var(--danger)]"
    >
      Remove
    </button>
  );
}

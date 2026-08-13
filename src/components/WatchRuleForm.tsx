"use client";

import { useTransition } from "react";
import type { CategoryBucket } from "@/lib/types";
import { addWatchRule } from "@/lib/actions";

export function WatchRuleForm({
  brandId,
  brandName,
  bucket,
}: {
  brandId: string;
  brandName: string;
  bucket: CategoryBucket;
}) {
  const [pending, start] = useTransition();

  return (
    <div>
      <p className="text-sm text-[var(--muted)]">Watch everything like this</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
          onClick={() =>
            start(() =>
              addWatchRule({
                label: `All new from ${brandName}`,
                brandId,
              })
            )
          }
        >
          Watch {brandName}
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
          onClick={() =>
            start(() =>
              addWatchRule({
                label: `New ${bucket} launches`,
                bucket,
              })
            )
          }
        >
          Watch {bucket}
        </button>
      </div>
    </div>
  );
}

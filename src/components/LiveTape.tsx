import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { ChangeEvent } from "@/lib/types";
import { getLaunchById } from "@/lib/repo";

export function LiveTape({ events, dense }: { events: ChangeEvent[]; dense?: boolean }) {
  return (
    <div className={`panel rounded-2xl ${dense ? "p-3" : "p-4"}`}>
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        <span className="live-dot" />
        Live — global launch intelligence
      </div>
      <ul className="space-y-2">
        {events.map((e) => {
          const launch = e.launchId ? getLaunchById(e.launchId) : undefined;
          return (
            <li
              key={e.id}
              className="flex items-start justify-between gap-3 border-t border-[var(--line)] pt-2 text-sm first:border-0 first:pt-0"
            >
              <div>
                <div className="text-[var(--text)]">{e.message}</div>
                {launch && (
                  <Link
                    href={`/launch/${launch.slug}`}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    View launch →
                  </Link>
                )}
              </div>
              <time className="shrink-0 text-xs text-[var(--muted)]">
                {formatDistanceToNow(parseISO(e.at), { addSuffix: true })}
              </time>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

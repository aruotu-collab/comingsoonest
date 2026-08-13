import Link from "next/link";
import { format } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { calendarDays, brandName, yearHeatmap } from "@/lib/repo";
import { getWatches } from "@/lib/watches";
import { STATUS_LABEL } from "@/lib/types";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const watches = await getWatches();
  const watchIds = new Set(watches.map((w) => w.launchId));
  const days = calendarDays(18);
  const heat = yearHeatmap();

  return (
    <AppShell active="/calendar">
      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Calendar · Yesterday. Today. Next.
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl md:text-5xl">
          Scroll the future
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Coming Up on each date — plus On This Day history. The world’s launch
          calendar.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {[
            ["all", "All"],
            ["watching", "Watching"],
            ["foryou", "For you"],
          ].map(([id, label]) => (
            <Link
              key={id}
              href={`/calendar?filter=${id}`}
              className={`rounded-full px-3 py-1.5 ${
                filter === id
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "bg-white/5 text-[var(--muted)]"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link href="/calendar/history" className="rounded-full bg-white/5 px-3 py-1.5 text-[var(--muted)]">
            History / Time Travel
          </Link>
        </div>
      </section>

      <section className="panel mb-6 rounded-2xl p-4">
        <h2 className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          2026 launch heatmap
        </h2>
        <div className="grid grid-cols-6 gap-2 md:grid-cols-12">
          {heat.map((m) => (
            <div key={m.month} className="text-center">
              <div
                className={`mx-auto mb-1 rounded-sm ${m.hot ? "bg-[var(--hot)]" : "bg-[var(--accent)]"}`}
                style={{ height: 8 + m.weight * 4, width: "100%", opacity: 0.35 + m.weight / 20 }}
              />
              <div className="text-[10px] text-[var(--muted)]">{m.month}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        {days.map((day) => {
          let list = day.launches;
          if (filter === "watching") list = list.filter((l) => watchIds.has(l.id));
          if (filter === "foryou") {
            list = list.filter(
              (l) =>
                watchIds.has(l.id) ||
                ["beauty", "tech", "wear", "play"].includes(l.bucket)
            );
          }

          const empty = list.length === 0;

          return (
            <section key={day.key} className="panel rise rounded-2xl p-4 md:p-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl">
                    {day.label}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {empty
                      ? "Nothing major confirmed — tracking undated launches that week"
                      : `${list.length} launches · ${
                          list.length >= 3 ? "Very active day" : "Quiet day"
                        }`}
                  </p>
                </div>
                {!empty && (
                  <div className="text-sm text-[var(--muted)]">
                    {list.reduce((s, l) => s + l.watchers, 0).toLocaleString()} watching
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
                    Coming up
                  </h3>
                  {empty ? (
                    <p className="text-sm text-[var(--muted)]">
                      Browse undated watches on{" "}
                      <Link href="/my-future" className="text-[var(--accent)]">
                        My Future
                      </Link>
                      .
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {list.map((l) => (
                        <li key={l.id}>
                          <Link
                            href={`/launch/${l.slug}`}
                            className="flex items-start justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 hover:bg-[var(--accent-soft)]"
                          >
                            <div>
                              <div className="font-medium">
                                {brandName(l)} — {l.name}
                              </div>
                              <div className="text-xs text-[var(--muted)]">
                                {STATUS_LABEL[l.status]} · Launch {l.launchScore} ·{" "}
                                {l.watchers.toLocaleString()} watching
                              </div>
                            </div>
                            {watchIds.has(l.id) && (
                              <span className="text-xs text-[var(--accent)]">Watching</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--hot)]">
                    On this day
                  </h3>
                  {day.history.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">
                      Archive growing — {format(day.date, "d MMMM")} history seeding.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {day.history.map((h) => (
                        <li key={h.id} className="rounded-xl bg-white/5 px-3 py-2">
                          <div className="font-medium">
                            {h.launchedAt.slice(0, 4)} — {h.brand} {h.name}
                          </div>
                          <div className="text-[var(--muted)]">{h.note}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}

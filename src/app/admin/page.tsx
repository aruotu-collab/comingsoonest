import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/lib/admin";
import { getAdminStats } from "@/lib/admin-stats";
import { format } from "date-fns";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="panel rounded-2xl p-4">
      <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-1 font-[family-name:var(--font-display)] text-3xl">
        {value}
      </div>
      {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

function RankTable({
  title,
  rows,
  empty = "Nothing yet — traffic will appear as people use the site.",
}: {
  title: string;
  rows: { key: string; count: number; href?: string }[];
  empty?: string;
}) {
  return (
    <section className="panel rounded-2xl p-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">{empty}</p>
      ) : (
        <ol className="mt-4 space-y-2 text-sm">
          {rows.map((r, i) => (
            <li
              key={`${r.key}-${i}`}
              className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-2"
            >
              <span className="min-w-0 break-all">
                <span className="mr-2 text-[var(--muted)]">{i + 1}.</span>
                {r.href ? (
                  <Link href={r.href} className="hover:text-[var(--accent)]">
                    {r.key}
                  </Link>
                ) : (
                  r.key
                )}
              </span>
              <span className="shrink-0 tabular-nums text-[var(--accent)]">
                {r.count.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/signin?next=/admin");
  }

  const s = await getAdminStats();

  return (
    <AppShell active="/admin">
      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--hot)]">
          Admin · {admin.email}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Members, traffic, clicks, and visitor IPs. Only visible to your admin
          account.
        </p>
      </section>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Members" value={s.members} hint={`+${s.members30d} in 30 days`} />
        <Stat label="Pageviews (24h)" value={s.pageviews1d} hint={`${s.pageviews7d} in 7 days`} />
        <Stat label="Clicks (7d)" value={s.clicks7d} hint={`${s.clicksAll} all time`} />
        <Stat
          label="Unique visitors (7d)"
          value={s.uniqueVisitors7d}
          hint={`${s.activeSessions} active sessions`}
        />
        <Stat label="Watches" value={s.watches} />
        <Stat label="Pageviews (all)" value={s.pageviewsAll} />
        <Stat label="Clicks (all)" value={s.clicksAll} />
        <Stat label="Active sessions" value={s.activeSessions} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <RankTable
          title="Top pages (7 days)"
          rows={s.topPaths.map((r) => ({ ...r, href: r.key }))}
        />
        <RankTable
          title="What people click (7 days)"
          rows={s.topClicks}
        />
        <RankTable
          title="Visitor IPs (7 days)"
          rows={s.topIps}
          empty="IPs appear after visitors browse with tracking on."
        />
        <RankTable
          title="Countries (7 days)"
          rows={s.topCountries}
          empty="Country codes come from Vercel when available."
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <RankTable
          title="Top launch pages (7 days)"
          rows={s.topLaunches.map((r) => ({
            key: r.slug,
            count: r.count,
            href: `/launch/${r.slug}`,
          }))}
        />
        <RankTable
          title="Most watched launches"
          rows={s.topWatched.map((r) => ({
            key: r.name,
            count: r.count,
            href: r.slug ? `/launch/${r.slug}` : undefined,
          }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Members
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {s.recentMembers.map((u) => (
              <li
                key={u.email}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-2"
              >
                <span>{u.email}</span>
                <span className="text-xs text-[var(--muted)]">
                  {format(u.createdAt, "d MMM yyyy")} · {u._count.watches} watches
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Live activity
          </h2>
          <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto text-sm">
            {s.recentEvents.length === 0 ? (
              <li className="text-[var(--muted)]">
                No events yet. Browse the site while signed in as admin — others’
                visits will show here.
              </li>
            ) : (
              s.recentEvents.map((e, i) => (
                <li
                  key={`${e.createdAt.toISOString()}-${i}`}
                  className="border-b border-[var(--line)] pb-2"
                >
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <span className="text-[var(--accent)]">{e.type}</span>
                    <span className="break-all">{e.path}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--muted)]">
                    {format(e.createdAt, "d MMM HH:mm:ss")}
                    {e.ip ? ` · ${e.ip}` : ""}
                    {e.country ? ` · ${e.country}` : ""}
                    {e.label ? ` · ${e.label}` : ""}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

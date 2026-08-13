import Link from "next/link";
import { CategoryNav } from "@/components/CategoryNav";
import { totalWatchers } from "@/lib/repo";
import { getProfile, getWatches } from "@/lib/watches";

const nav = [
  { href: "/", label: "Discover" },
  { href: "/calendar", label: "Calendar" },
  { href: "/watching", label: "Watching" },
  { href: "/radar", label: "Radar" },
  { href: "/live", label: "Live" },
  { href: "/my-future", label: "My Future" },
  { href: "/rankings", label: "Rankings" },
];

export async function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const watches = await getWatches();
  const profile = await getProfile();
  const watchers = totalWatchers();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="min-w-0">
            <div className="font-[family-name:var(--font-display)] text-xl tracking-[0.04em] md:text-2xl">
              COMING SOONEST
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
              Watch what’s next
            </div>
          </Link>

          <div className="hidden items-center gap-3 text-xs text-[var(--muted)] md:flex">
            <span className="inline-flex items-center gap-2">
              <span className="live-dot" />
              LIVE
            </span>
            <span>{watchers.toLocaleString()} things being watched</span>
            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[var(--accent)]">
              {watches.length} watching
            </span>
            {profile.email && (
              <span className="max-w-[160px] truncate" title={profile.email}>
                {profile.email}
              </span>
            )}
          </div>

          <Link
            href="/search"
            className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            What’s coming?
          </Link>
        </div>

        <nav
          aria-label="Main"
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 md:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {nav.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <CategoryNav />
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>

      <footer className="border-t border-[var(--line)] py-8 text-center text-sm text-[var(--muted)]">
        <p className="font-[family-name:var(--font-display)] text-lg tracking-wide text-[var(--text)]">
          Stop searching for what’s next. Watch it.
        </p>
        <p className="mt-2">
          Yesterday. Today. Next. — comingsoonest.com
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
          <Link href="/plus" className="hover:text-[var(--accent)]">
            Coming Soon+
          </Link>
          <Link href="/brands" className="hover:text-[var(--accent)]">
            Brands
          </Link>
          <Link href="/scouts" className="hover:text-[var(--accent)]">
            Submit a Signal
          </Link>
          <Link href="/intelligence" className="hover:text-[var(--accent)]">
            Intelligence
          </Link>
        </div>
      </footer>
    </div>
  );
}

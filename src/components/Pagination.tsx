import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const window = buildWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4"
    >
      <Link
        href={hrefForPage(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`rounded-full px-3 py-1.5 text-sm ${
          page <= 1
            ? "pointer-events-none text-[var(--muted)] opacity-40"
            : "bg-white/5 text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        ← Previous
      </Link>

      <ul className="flex flex-wrap items-center gap-1">
        {window.map((item, i) =>
          item === "…" ? (
            <li key={`gap-${i}`} className="px-1 text-sm text-[var(--muted)]">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefForPage(item)}
                aria-current={item === page ? "page" : undefined}
                className={`inline-flex min-w-9 items-center justify-center rounded-full px-2.5 py-1.5 text-sm ${
                  item === page
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]"
                }`}
              >
                {item}
              </Link>
            </li>
          )
        )}
      </ul>

      <Link
        href={hrefForPage(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`rounded-full px-3 py-1.5 text-sm ${
          page >= totalPages
            ? "pointer-events-none text-[var(--muted)] opacity-40"
            : "bg-white/5 text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        Next →
      </Link>
    </nav>
  );
}

function buildWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, totalPages, page, page - 1, page + 1, page - 2, page + 2]);
  const nums = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) out.push("…");
    out.push(nums[i]);
  }
  return out;
}

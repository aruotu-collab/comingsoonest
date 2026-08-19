export const PAGE_SIZE = 24;

export function parsePage(raw: string | undefined | null): number {
  const n = Number.parseInt(String(raw || "1"), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    total,
    totalPages,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}

/** Keep existing query params; set or clear `page`. */
export function pageHref(
  pathname: string,
  searchParams: Record<string, string | undefined>,
  page: number
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (value != null && value !== "") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `${pathname}?${q}` : pathname;
}

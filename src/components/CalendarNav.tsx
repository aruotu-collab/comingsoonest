"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { HorizontalScroll } from "@/components/HorizontalScroll";

const VIEW_FILTERS = [
  { id: "all", label: "All" },
  { id: "watching", label: "Watching" },
  { id: "foryou", label: "For you" },
] as const;

const CALENDAR_CATEGORIES = [
  "trainers",
  "gaming",
  "books",
  "lego",
  "perfume",
  "tech",
  "beauty",
  "phones",
  "headphones",
] as const;

function calendarHref(opts: { filter: string; category?: string }) {
  const params = new URLSearchParams();
  if (opts.filter && opts.filter !== "all") params.set("filter", opts.filter);
  if (opts.category) params.set("category", opts.category);
  const q = params.toString();
  return q ? `/calendar?${q}` : "/calendar";
}

export function CalendarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "all";
  const category = searchParams.get("category") || undefined;
  const activeCategory =
    category && CATEGORIES.some((c) => c.slug === category) ? category : undefined;
  const onHistory = pathname.startsWith("/calendar/history");

  return (
    <div className="border-t border-[var(--line)]">
      <HorizontalScroll ariaLabel="Calendar filters">
        {VIEW_FILTERS.map((item) => {
          const isActive = !onHistory && filter === item.id;
          return (
            <Link
              key={item.id}
              href={calendarHref({ filter: item.id, category: activeCategory })}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition md:text-sm ${
                isActive
                  ? "bg-white/10 text-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/calendar/history"
          className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition md:text-sm ${
            onHistory
              ? "bg-white/10 text-[var(--text)]"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          History
        </Link>
        <span
          aria-hidden
          className="mx-1 h-4 w-px shrink-0 self-center bg-[var(--line)]"
        />
        <Link
          href={calendarHref({ filter })}
          className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs transition md:text-sm ${
            !onHistory && !activeCategory
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--text)]"
          }`}
        >
          All categories
        </Link>
        {CALENDAR_CATEGORIES.map((slug) => {
          const cat = CATEGORIES.find((c) => c.slug === slug);
          if (!cat) return null;
          const isActive = !onHistory && activeCategory === slug;
          return (
            <Link
              key={slug}
              href={calendarHref({ filter, category: slug })}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs transition md:text-sm ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--text)]"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </HorizontalScroll>
    </div>
  );
}

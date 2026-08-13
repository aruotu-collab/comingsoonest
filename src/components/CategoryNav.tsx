"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

export function CategoryNav() {
  const pathname = usePathname();

  return (
    <div className="border-t border-[var(--line)]">
      <nav
        aria-label="Categories"
        className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 py-2.5 md:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          href="/"
          className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition md:text-sm ${
            pathname === "/"
              ? "bg-white/10 text-[var(--text)]"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => {
          const href = `/category/${cat.slug}`;
          const isActive =
            pathname === href ||
            (cat.slug === "perfume" && pathname === "/beauty");
          return (
            <Link
              key={cat.slug}
              href={href}
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
      </nav>
    </div>
  );
}

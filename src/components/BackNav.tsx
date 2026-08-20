"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Prefer in-app history back; otherwise go to the provided fallback (usually category).
 */
export function BackNav({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const router = useRouter();

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
      <button
        type="button"
        onClick={() => {
          try {
            const ref = document.referrer;
            if (ref) {
              const origin = window.location.origin;
              if (new URL(ref).origin === origin) {
                router.back();
                return;
              }
            }
          } catch {
            // fall through
          }
          router.push(href);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
      >
        ← Back
      </button>
      <nav aria-label="Breadcrumb" className="text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          Discover
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={href} className="hover:text-[var(--accent)]">
          {label}
        </Link>
      </nav>
    </div>
  );
}

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
    <div className="mb-5 flex flex-wrap items-center gap-3">
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
        className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)] ring-1 ring-[var(--accent)]/35 transition hover:bg-[var(--accent)] hover:text-[#061018]"
      >
        <span aria-hidden>←</span>
        Back to {label}
      </button>
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]">
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

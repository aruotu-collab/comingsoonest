"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "@/lib/actions";

export function AuthControls({
  email,
}: {
  email?: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const signedIn = Boolean(email);

  if (!signedIn) {
    return (
      <Link
        href="/signin"
        className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden max-w-[140px] truncate text-xs text-[var(--muted)] sm:inline"
        title={email ?? undefined}
      >
        {email}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          start(async () => {
            await signOut();
            router.refresh();
          });
        }}
        className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)] disabled:opacity-60"
      >
        {pending ? "…" : "Sign out"}
      </button>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ensureEmailSession } from "@/lib/actions";

export function SignInForm({
  title = "See what you’re watching",
  description = "Enter the email you used when you watched launches. We’ll restore your list on this device.",
  submitLabel = "Show my watches",
}: {
  title?: string;
  description?: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="mx-auto max-w-md space-y-3 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          try {
            setError(null);
            await ensureEmailSession(email);
            const next = searchParams.get("next");
            if (next && next.startsWith("/")) {
              router.push(next);
            } else if (
              typeof window !== "undefined" &&
              window.location.pathname === "/signin"
            ) {
              router.push("/watching");
            } else {
              router.refresh();
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not sign in");
          }
        });
      }}
    >
      <h2 className="font-[family-name:var(--font-display)] text-xl">{title}</h2>
      <p className="text-sm text-[var(--muted)]">{description}</p>
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 outline-none focus:border-[var(--accent)]"
      />
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#061018] disabled:opacity-60"
      >
        {pending ? "Loading…" : submitLabel}
      </button>
    </form>
  );
}

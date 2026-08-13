"use client";

import { useState, useTransition } from "react";
import { ensureEmailSession, watchLaunch, unwatchLaunch } from "@/lib/actions";

export function WatchButton({
  launchId,
  watching,
  compact,
  hasSession,
}: {
  launchId: string;
  watching: boolean;
  compact?: boolean;
  hasSession?: boolean;
}) {
  const [pending, start] = useTransition();
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function doWatch() {
    const result = await watchLaunch(launchId);
    if (result.needsEmail) {
      setShowEmail(true);
      return;
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            if (watching) await unwatchLaunch(launchId);
            else if (!hasSession && !watching) setShowEmail(true);
            else await doWatch();
          })
        }
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
          watching
            ? "border border-[var(--accent)] bg-transparent text-[var(--accent)]"
            : "bg-[var(--accent)] text-[#061018] hover:brightness-110"
        } ${compact ? "text-xs" : ""}`}
      >
        {pending ? "…" : watching ? "Watching" : "Watch"}
      </button>

      {showEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="panel w-full max-w-md rounded-2xl p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              Watch this launch
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Enter your email and we’ll alert you when the date, price, UK
              availability, preorder, or go-live status changes.
            </p>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                start(async () => {
                  try {
                    setError(null);
                    await ensureEmailSession(email);
                    const result = await watchLaunch(launchId);
                    if (result.ok) setShowEmail(false);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not save");
                  }
                });
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 outline-none focus:border-[var(--accent)]"
              />
              {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full px-3 py-1.5 text-sm text-[var(--muted)]"
                  onClick={() => setShowEmail(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[#061018]"
                >
                  {pending ? "Saving…" : "Start watching"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

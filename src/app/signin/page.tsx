import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { SignInForm } from "@/components/SignInForm";
import { getProfile } from "@/lib/watches";
import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const profile = await getProfile();
  const { next } = await searchParams;
  if (profile.email) {
    redirect(next && next.startsWith("/") ? next : "/watching");
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Account
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Sign in
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Use the email you watch launches with. No password — we’ll restore your
          list on this device.
        </p>
        <section className="panel mt-6 rounded-2xl p-6 md:p-8">
          <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading…</p>}>
            <SignInForm
              title="Welcome back"
              description="Enter your email to restore watches and alerts."
              submitLabel="Sign in"
            />
          </Suspense>
        </section>
      </section>
    </AppShell>
  );
}

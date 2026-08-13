import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getLaunches, openingNearYou, brandName } from "@/lib/repo";

export default async function RadarPage() {
  const all = getLaunches().filter((l) => l.expectedAt);
  const near = openingNearYou();

  const rings = [
    { label: "NOW", max: 2, items: all.filter((l) => l.status === "dropping" || l.status === "live") },
    {
      label: "< 7 DAYS",
      max: 7,
      items: all.filter((l) => {
        if (!l.expectedAt) return false;
        const days = (new Date(l.expectedAt).getTime() - Date.now()) / 86400000;
        return days > 0 && days <= 7;
      }),
    },
    {
      label: "< 30 DAYS",
      max: 30,
      items: all.filter((l) => {
        if (!l.expectedAt) return false;
        const days = (new Date(l.expectedAt).getTime() - Date.now()) / 86400000;
        return days > 7 && days <= 30;
      }),
    },
    {
      label: "< 90 DAYS",
      max: 90,
      items: all.filter((l) => {
        if (!l.expectedAt) return false;
        const days = (new Date(l.expectedAt).getTime() - Date.now()) / 86400000;
        return days > 30 && days <= 90;
      }),
    },
  ];

  return (
    <AppShell active="/radar">
      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Radar · Conceptual time rings
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Coming Soon Radar
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Big dot = high anticipation. Hot = accelerating. Pulse = newly
          detected. Geographic near-me comes next.
        </p>
      </section>

      <div className="relative mx-auto mb-10 flex aspect-square max-w-xl items-center justify-center">
        <div className="radar-ring absolute inset-[8%]" />
        <div className="radar-ring absolute inset-[22%]" />
        <div className="radar-ring absolute inset-[36%]" />
        <div className="radar-ring absolute inset-[50%]" />
        <div className="absolute text-center">
          <div className="live-dot mx-auto mb-2" />
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">You</div>
        </div>
        {rings.flatMap((ring, ri) =>
          ring.items.slice(0, 3).map((l, i) => {
            const angle = (ri * 70 + i * 35) * (Math.PI / 180);
            const radius = 28 + ri * 14;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            const size = 10 + l.launchScore / 12;
            return (
              <Link
                key={l.id}
                href={`/launch/${l.slug}`}
                title={`${brandName(l)} — ${l.name}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_20px_rgba(61,156,240,0.45)]"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: size,
                  height: size,
                  opacity: 0.55 + l.momentum7d / 300,
                }}
              />
            );
          })
        )}
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {rings.map((ring) => (
          <section key={ring.label} className="panel rounded-2xl p-4">
            <h2 className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
              {ring.label}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {ring.items.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <Link href={`/launch/${l.slug}`} className="hover:text-[var(--accent)]">
                    {brandName(l)} · {l.name}
                  </Link>
                  <div className="text-xs text-[var(--muted)]">
                    Launch {l.launchScore} · {l.watchers.toLocaleString()} watching
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="panel rounded-2xl p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Opening near you
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Geographic radar — restaurants, gyms, hotels, attractions…
        </p>
        <ul className="mt-4 space-y-3">
          {near.map((l) => (
            <li key={l.id}>
              <Link href={`/launch/${l.slug}`} className="block rounded-xl bg-white/5 px-3 py-3 hover:bg-[var(--accent-soft)]">
                <div className="font-medium">
                  {l.name} · {l.nearMiles} mi
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {l.expectedLabel} · {l.watchers.toLocaleString()} locals watching
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

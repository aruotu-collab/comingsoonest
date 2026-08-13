import { AppShell } from "@/components/AppShell";

export default function PlusPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          Coming Soon+
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Don’t charge people to learn something exists. Charge power users to
          have Coming Soon continuously monitor things for them.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              name: "Free",
              price: "£0",
              items: [
                "Watch up to 20",
                "Daily digest",
                "Basic + historical calendar",
                "Release-date alerts",
                "Personalised feed",
              ],
            },
            {
              name: "Coming Soon+",
              price: "£4.99/mo",
              items: [
                "Unlimited watches",
                "Instant alerts",
                "Early detection",
                "Price / preorder / sample / stock",
                "Calendar sync",
                "Should I Wait?",
                "High-risk drop alerts",
              ],
            },
            {
              name: "Pro / Collector",
              price: "£9.99/mo",
              items: [
                "Vertical obsession packs",
                "Every UK perfume release",
                "Limited editions",
                "First retailer sightings",
                "Discontinuation warnings",
              ],
            },
          ].map((tier) => (
            <div key={tier.name} className="panel rounded-2xl p-5">
              <h2 className="font-[family-name:var(--font-display)] text-xl">
                {tier.name}
              </h2>
              <p className="mt-1 text-[var(--accent)]">{tier.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {tier.items.map((i) => (
                  <li key={i}>✓ {i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

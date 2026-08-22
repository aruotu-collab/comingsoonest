"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function track(payload: {
  type: "pageview" | "click";
  path: string;
  label?: string;
  href?: string;
}) {
  const body = JSON.stringify(payload);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/track", blob);
    return;
  }
  void fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function AnalyticsBeacon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const q = searchParams?.toString();
    const path = q ? `${pathname}?${q}` : pathname;
    track({ type: "pageview", path });
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest("a,button,[data-track]") as
        | HTMLElement
        | null;
      if (!el) return;

      const path = window.location.pathname + window.location.search;
      if (path.startsWith("/admin")) return;

      const label =
        el.getAttribute("data-track") ||
        el.getAttribute("aria-label") ||
        el.textContent?.replace(/\s+/g, " ").trim().slice(0, 120) ||
        el.tagName;

      const href =
        el instanceof HTMLAnchorElement
          ? el.href
          : el.getAttribute("href") || undefined;

      track({ type: "click", path, label, href });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

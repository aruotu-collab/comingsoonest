"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { CategoryNav } from "@/components/CategoryNav";
import { CalendarNav } from "@/components/CalendarNav";

function isDiscoverPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/category/") ||
    pathname === "/beauty" ||
    pathname.startsWith("/brand/") ||
    pathname === "/search"
  );
}

function isCalendarPath(pathname: string) {
  return pathname === "/calendar" || pathname.startsWith("/calendar/");
}

function SecondaryNavInner() {
  const pathname = usePathname() || "/";

  if (isCalendarPath(pathname)) {
    return <CalendarNav />;
  }
  if (isDiscoverPath(pathname)) {
    return <CategoryNav />;
  }
  return null;
}

export function SecondaryNav() {
  return (
    <Suspense fallback={null}>
      <SecondaryNavInner />
    </Suspense>
  );
}

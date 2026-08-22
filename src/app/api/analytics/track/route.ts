import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "cs_vid";

function clientIp(request: Request): string | null {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || null;
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

async function ensureVisitorId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (existing && existing.length >= 16) return existing;

  const id = randomBytes(16).toString("hex");
  jar.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      type?: string;
      path?: string;
      label?: string;
      href?: string;
    };

    const type = body.type === "click" ? "click" : "pageview";
    const path = (body.path || "/").slice(0, 500);
    if (path.startsWith("/admin") || path.startsWith("/api/")) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const visitorId = await ensureVisitorId();
    const user = await getSessionUser();

    await prisma.analyticsEvent.create({
      data: {
        type,
        path,
        label: body.label?.slice(0, 300) || null,
        href: body.href?.slice(0, 500) || null,
        ip: clientIp(request)?.slice(0, 80) || null,
        country:
          request.headers.get("x-vercel-ip-country")?.slice(0, 8) || null,
        userAgent: request.headers.get("user-agent")?.slice(0, 400) || null,
        visitorId,
        userId: user?.id || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn("analytics track failed", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

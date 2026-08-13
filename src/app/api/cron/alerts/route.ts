import { NextResponse } from "next/server";
import { processAlertQueue } from "@/lib/alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  const url = new URL(request.url);
  const qsSecret = url.searchParams.get("secret");

  const ok =
    (secret && auth === `Bearer ${secret}`) ||
    (secret && qsSecret === secret);

  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processAlertQueue(120);
  return NextResponse.json({ ok: true, ...result });
}

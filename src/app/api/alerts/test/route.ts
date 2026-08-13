import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { processAlertQueue } from "@/lib/alerts";

export const dynamic = "force-dynamic";

/** Dev helper: insert a fresh change event for a watched launch and process queue */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in by watching something first" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { launchId?: string };
  const watch =
    (body.launchId &&
      (await prisma.watch.findUnique({
        where: { userId_launchId: { userId: user.id, launchId: body.launchId } },
      }))) ||
    (await prisma.watch.findFirst({ where: { userId: user.id } }));

  if (!watch) {
    return NextResponse.json({ error: "No watches yet" }, { status: 400 });
  }

  const event = await prisma.changeEvent.create({
    data: {
      at: new Date(),
      type: "date_confirmed",
      launchId: watch.launchId,
      message: "Test alert — date confirmed for a launch you watch",
      bucket: "beauty",
    },
  });

  const result = await processAlertQueue(5);
  return NextResponse.json({ ok: true, eventId: event.id, ...result });
}

import { NextResponse } from "next/server";
import { sendAlertEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { processAlertQueue } from "@/lib/alerts";

export const dynamic = "force-dynamic";

/**
 * Secure one-shot test:
 * Authorization: Bearer $CRON_SECRET
 * Body: { "email": "you@example.com", "launchId"?: "l-dior-nuit" }
 */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    launchId?: string;
  };

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const launchId = body.launchId || "l-dior-nuit";

  const user = await prisma.user.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  const watch = await prisma.watch.upsert({
    where: { userId_launchId: { userId: user.id, launchId } },
    create: {
      userId: user.id,
      launchId,
      intensity: "i_want_this",
      prefs: {
        dateConfirmed: true,
        ukAvailability: true,
        priceAppears: true,
        preordersOpen: true,
        samplesAvailable: true,
        reviewsAppear: true,
        twentyFourHours: true,
        goesLive: true,
        sellsOut: true,
        comesBack: true,
      },
    },
    update: {},
  });

  const event = await prisma.changeEvent.create({
    data: {
      at: new Date(),
      type: "date_confirmed",
      launchId,
      message: "Test alert — UK date confirmed for a launch you watch",
      bucket: "beauty",
    },
  });

  const queue = await processAlertQueue(5);

  // Also send a direct confirmation email so we know Resend/from-domain works
  const direct = await sendAlertEmail({
    to: email,
    subject: "Coming Soonest — email test",
    text: `Your verified domain send works.\nWatch id: ${watch.id}\nEvent: ${event.id}\nQueue: ${JSON.stringify(queue)}`,
    html: `<div style="font-family:sans-serif;padding:20px;background:#0c0f14;color:#e8edf5">
      <p>Coming Soonest email test</p>
      <p>Alerts will come from <strong>alerts@comingsoonest.com</strong>.</p>
      <p>Queue result: ${queue.sent} sent, ${queue.skipped} skipped.</p>
    </div>`,
  });

  return NextResponse.json({
    ok: true,
    email,
    launchId,
    eventId: event.id,
    queue,
    direct,
  });
}

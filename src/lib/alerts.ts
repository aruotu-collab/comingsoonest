import { prisma } from "@/lib/db";
import { sendAlertEmail } from "@/lib/email";
import { getLaunchById, brandName } from "@/lib/repo";
import type { WatchPrefs } from "@/lib/types";
import { DEFAULT_WATCH_PREFS } from "@/lib/types";

const TYPE_TO_PREF: Record<string, keyof WatchPrefs | null> = {
  date_confirmed: "dateConfirmed",
  date_changed: "dateConfirmed",
  uk_confirmed: "ukAvailability",
  price_detected: "priceAppears",
  preorder_live: "preordersOpen",
  sample_available: "samplesAvailable",
  went_live: "goesLive",
  sold_out: "sellsOut",
  restock: "comesBack",
  detected: null,
  announced: null,
  retailer_detected: "ukAvailability",
  momentum_spike: null,
  watch_joined: null,
};

function intensityAllows(intensity: string, type: string) {
  if (intensity === "must_get") return true;
  if (intensity === "relaxed") {
    return ["went_live", "date_confirmed", "date_changed"].includes(type);
  }
  if (intensity === "interested") {
    return [
      "went_live",
      "date_confirmed",
      "date_changed",
      "preorder_live",
      "price_detected",
      "uk_confirmed",
      "sold_out",
    ].includes(type);
  }
  // i_want_this
  return type !== "watch_joined" && type !== "momentum_spike";
}

export async function processAlertQueue(sinceMinutes = 60) {
  const since = new Date(Date.now() - sinceMinutes * 60 * 1000);
  const events = await prisma.changeEvent.findMany({
    where: { at: { gte: since }, launchId: { not: null } },
    orderBy: { at: "asc" },
  });

  let sent = 0;
  let skipped = 0;

  for (const event of events) {
    if (!event.launchId) continue;

    const watches = await prisma.watch.findMany({
      where: { launchId: event.launchId },
      include: { user: true },
    });

    for (const watch of watches) {
      const existing = await prisma.alertLog.findUnique({
        where: {
          userId_eventId: { userId: watch.userId, eventId: event.id },
        },
      });
      if (existing) {
        skipped += 1;
        continue;
      }

      const prefs = {
        ...DEFAULT_WATCH_PREFS,
        ...(watch.prefs as Partial<WatchPrefs>),
      };
      const prefKey = TYPE_TO_PREF[event.type];
      if (prefKey && !prefs[prefKey]) {
        skipped += 1;
        continue;
      }
      if (!intensityAllows(watch.intensity, event.type)) {
        skipped += 1;
        continue;
      }

      const launch = getLaunchById(event.launchId);
      const title = launch
        ? `${brandName(launch)} — ${launch.name}`
        : event.launchId;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://comingsoonest.com";
      const launchUrl = launch ? `${appUrl}/launch/${launch.slug}` : appUrl;

      const subject = `Launch alert: ${event.message}`;
      const text = [
        `Coming Soonest alert`,
        ``,
        title,
        event.message,
        ``,
        `Open: ${launchUrl}`,
        `Manage watches: ${appUrl}/watching`,
      ].join("\n");

      const html = `
        <div style="font-family:IBM Plex Sans,Segoe UI,sans-serif;background:#0c0f14;color:#e8edf5;padding:24px">
          <p style="letter-spacing:0.16em;text-transform:uppercase;color:#8b97a8;font-size:12px">Coming Soonest · Alert</p>
          <h1 style="font-size:22px;margin:8px 0 4px">${title}</h1>
          <p style="color:#3d9cf0;font-size:16px">${event.message}</p>
          <p><a href="${launchUrl}" style="color:#3d9cf0">View launch →</a></p>
          <p style="color:#8b97a8;font-size:12px"><a href="${appUrl}/watching" style="color:#8b97a8">Manage watches</a></p>
        </div>
      `;

      const result = await sendAlertEmail({
        to: watch.user.email,
        subject,
        html,
        text,
      });

      await prisma.alertLog.create({
        data: {
          userId: watch.userId,
          watchId: watch.id,
          eventId: event.id,
          status: result.ok ? "sent" : "failed",
          channel: "email",
        },
      });

      if (result.ok) sent += 1;
    }
  }

  return { events: events.length, sent, skipped };
}

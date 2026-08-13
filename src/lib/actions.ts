"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createSessionForEmail, getSessionUser } from "@/lib/session";
import type { AlertIntensity, WatchPrefs, WatchRule } from "@/lib/types";
import { DEFAULT_WATCH_PREFS } from "@/lib/types";

export async function ensureEmailSession(email: string, name?: string) {
  const user = await createSessionForEmail(email, name);
  revalidatePath("/", "layout");
  return { ok: true as const, email: user.email };
}

export async function watchLaunch(
  launchId: string,
  prefs: Partial<WatchPrefs> = {},
  intensity: AlertIntensity = "i_want_this"
) {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false as const, needsEmail: true as const };
  }

  await prisma.watch.upsert({
    where: { userId_launchId: { userId: user.id, launchId } },
    create: {
      userId: user.id,
      launchId,
      intensity,
      prefs: { ...DEFAULT_WATCH_PREFS, ...prefs },
    },
    update: {
      intensity,
      prefs: { ...DEFAULT_WATCH_PREFS, ...prefs },
    },
  });

  revalidatePath("/", "layout");
  return { ok: true as const, needsEmail: false as const };
}

export async function unwatchLaunch(launchId: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const };

  await prisma.watch.deleteMany({ where: { userId: user.id, launchId } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function updateWatchIntensity(launchId: string, intensity: AlertIntensity) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const };

  await prisma.watch.updateMany({
    where: { userId: user.id, launchId },
    data: { intensity },
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function addWatchRule(rule: Omit<WatchRule, "id">) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, needsEmail: true as const };

  await prisma.watchRule.create({
    data: {
      userId: user.id,
      label: rule.label,
      brandId: rule.brandId,
      bucket: rule.bucket,
      query: rule.query,
    },
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function removeWatchRule(id: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const };

  await prisma.watchRule.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

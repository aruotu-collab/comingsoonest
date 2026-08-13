"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { AlertIntensity, Watch, WatchPrefs, WatchRule } from "@/lib/types";
import { DEFAULT_WATCH_PREFS } from "@/lib/types";

const WATCH_COOKIE = "cs_watches";
const RULES_COOKIE = "cs_watch_rules";

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeWatches(watches: Watch[]) {
  const jar = await cookies();
  jar.set(WATCH_COOKIE, JSON.stringify(watches), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

async function writeRules(rules: WatchRule[]) {
  const jar = await cookies();
  jar.set(RULES_COOKIE, JSON.stringify(rules), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function watchLaunch(
  launchId: string,
  prefs: Partial<WatchPrefs> = {},
  intensity: AlertIntensity = "i_want_this"
) {
  const jar = await cookies();
  const watches = parseJson<Watch[]>(jar.get(WATCH_COOKIE)?.value, []);
  if (!watches.some((w) => w.launchId === launchId)) {
    watches.push({
      launchId,
      intensity,
      prefs: { ...DEFAULT_WATCH_PREFS, ...prefs },
      createdAt: new Date().toISOString(),
    });
    await writeWatches(watches);
  }
  revalidatePath("/", "layout");
}

export async function unwatchLaunch(launchId: string) {
  const jar = await cookies();
  const watches = parseJson<Watch[]>(jar.get(WATCH_COOKIE)?.value, []);
  await writeWatches(watches.filter((w) => w.launchId !== launchId));
  revalidatePath("/", "layout");
}

export async function updateWatchIntensity(launchId: string, intensity: AlertIntensity) {
  const jar = await cookies();
  const watches = parseJson<Watch[]>(jar.get(WATCH_COOKIE)?.value, []);
  const next = watches.map((w) => (w.launchId === launchId ? { ...w, intensity } : w));
  await writeWatches(next);
  revalidatePath("/", "layout");
}

export async function addWatchRule(rule: Omit<WatchRule, "id">) {
  const jar = await cookies();
  const rules = parseJson<WatchRule[]>(jar.get(RULES_COOKIE)?.value, []);
  rules.push({ ...rule, id: `r-${Date.now()}` });
  await writeRules(rules);
  revalidatePath("/", "layout");
}

export async function removeWatchRule(id: string) {
  const jar = await cookies();
  const rules = parseJson<WatchRule[]>(jar.get(RULES_COOKIE)?.value, []);
  await writeRules(rules.filter((r) => r.id !== id));
  revalidatePath("/", "layout");
}

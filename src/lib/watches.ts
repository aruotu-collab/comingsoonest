import { cookies } from "next/headers";
import type { AlertIntensity, Watch, WatchPrefs, WatchRule } from "@/lib/types";
import { DEFAULT_WATCH_PREFS } from "@/lib/types";

const WATCH_COOKIE = "cs_watches";
const RULES_COOKIE = "cs_watch_rules";
const PROFILE_COOKIE = "cs_profile";

export interface UserProfile {
  name: string;
  location: string;
  interests: string[];
  birthday?: string;
}

const defaultProfile: UserProfile = {
  name: "James",
  location: "SW1",
  interests: ["Fragrance", "Tech", "Fashion", "Family"],
  birthday: "2000-10-04",
};

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getWatches(): Promise<Watch[]> {
  const jar = await cookies();
  return parseJson<Watch[]>(jar.get(WATCH_COOKIE)?.value, []);
}

export async function getWatchRules(): Promise<WatchRule[]> {
  const jar = await cookies();
  return parseJson<WatchRule[]>(jar.get(RULES_COOKIE)?.value, []);
}

export async function getProfile(): Promise<UserProfile> {
  const jar = await cookies();
  return parseJson<UserProfile>(jar.get(PROFILE_COOKIE)?.value, defaultProfile);
}

export async function isWatching(launchId: string): Promise<boolean> {
  const watches = await getWatches();
  return watches.some((w) => w.launchId === launchId);
}

export { DEFAULT_WATCH_PREFS };
export type { AlertIntensity, WatchPrefs };

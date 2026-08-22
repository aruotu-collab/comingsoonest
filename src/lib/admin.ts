import { getSessionUser } from "@/lib/session";

const DEFAULT_ADMINS = ["aruotu@gmail.com"];

export function adminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...DEFAULT_ADMINS, ...fromEnv])];
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return null;
  }
  return user;
}

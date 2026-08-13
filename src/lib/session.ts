import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "cs_session";
const SESSION_DAYS = 90;

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }

  return session.user;
}

export async function createSessionForEmail(email: string, name?: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Enter a valid email address");
  }

  const user = await prisma.user.upsert({
    where: { email: normalized },
    create: { email: normalized, name: name?.trim() || null },
    update: name ? { name: name.trim() } : {},
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await prisma.session.create({
    data: { token, userId: user.id, expiresAt },
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return user;
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => undefined);
  }
  jar.delete(SESSION_COOKIE);
}

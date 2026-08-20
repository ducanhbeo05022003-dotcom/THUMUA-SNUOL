import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as bcrypt from "bcryptjs";
import { getPrismaClient } from "./prisma";

const SESSION_COOKIE = "qlmh_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = Math.random().toString(36).slice(2);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await getPrismaClient().session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await getPrismaClient().session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await getPrismaClient().session.delete({ where: { token } });
    }
    return null;
  }

  return session.user;
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(...roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect("/");
  }
  return user;
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }

  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { config } from "./config";

export type UserRole = "analyst" | "viewer";

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
  connectionId?: string | null;
};

const COOKIE = "bi_session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload) {
  const key = new TextEncoder().encode(config.jwtSecret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(key);
}

export async function verifySessionToken(token: string) {
  const key = new TextEncoder().encode(config.jwtSecret);
  const { payload } = await jwtVerify(token, key);
  return payload as unknown as SessionPayload;
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function requireRole(
  session: SessionPayload | null,
  roles: UserRole[],
): session is SessionPayload {
  return !!session && roles.includes(session.role);
}

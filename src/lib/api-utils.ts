import { NextResponse } from "next/server";
import { getSession, requireRole, type SessionPayload } from "./auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireSession(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Требуется авторизация", 401);
  return session;
}

export async function requireAnalyst(): Promise<SessionPayload | NextResponse> {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  if (!requireRole(session, ["analyst"])) {
    return jsonError("Доступ только для роли analyst", 403);
  }
  return session;
}

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { users } from "@/drizzle/schema";
import {
  setSessionCookie,
  verifyPassword,
  type SessionPayload,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Неверные данные входа");

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  const user = rows[0];
  if (!user) return jsonError("Неверный email или пароль", 401);

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return jsonError("Неверный email или пароль", 401);

  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    role: user.role as SessionPayload["role"],
    connectionId: "demo",
  };
  await setSessionCookie(payload);
  return NextResponse.json({ email: user.email, role: user.role });
}

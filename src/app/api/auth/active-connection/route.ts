import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  getSession,
  type SessionPayload,
} from "@/lib/auth";
import { jsonError, requireAnalyst } from "@/lib/api-utils";
import { cookies } from "next/headers";

const schema = z.object({
  connectionId: z.string().nullable(),
});

export async function POST(request: Request) {
  const session = await requireAnalyst();
  if (session instanceof NextResponse) return session;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Неверный connectionId");

  const next: SessionPayload = {
    ...session,
    connectionId: parsed.data.connectionId ?? "demo",
  };
  const token = await createSessionToken(next);
  const store = await cookies();
  store.set("bi_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return NextResponse.json({ connectionId: next.connectionId });
}

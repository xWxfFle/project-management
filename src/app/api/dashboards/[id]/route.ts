import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { dashboards } from "@/drizzle/schema";
import { requireSession, jsonError } from "@/lib/api-utils";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const rows = await db
    .select()
    .from(dashboards)
    .where(eq(dashboards.id, id))
    .limit(1);

  const dash = rows[0];
  if (!dash) return jsonError("Дашборд не найден", 404);
  return NextResponse.json({ dashboard: dash });
}

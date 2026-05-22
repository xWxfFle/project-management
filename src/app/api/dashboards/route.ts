import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dashboards } from "@/drizzle/schema";
import { requireSession, requireAnalyst, jsonError } from "@/lib/api-utils";
import { db } from "@/lib/db";

const createSchema = z.object({
  title: z.string().min(1),
  sql: z.string().min(1),
  snapshot: z.object({
    columns: z.array(z.string()),
    rows: z.array(z.array(z.unknown())),
  }),
});

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const rows = await db
    .select({
      id: dashboards.id,
      title: dashboards.title,
      createdAt: dashboards.createdAt,
    })
    .from(dashboards)
    .orderBy(desc(dashboards.createdAt));

  return NextResponse.json({ dashboards: rows });
}

export async function POST(request: Request) {
  const session = await requireAnalyst();
  if (session instanceof NextResponse) return session;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("title, sql, snapshot обязательны");

  const [row] = await db
    .insert(dashboards)
    .values({
      userId: session.sub,
      title: parsed.data.title,
      sql: parsed.data.sql,
      snapshot: parsed.data.snapshot,
    })
    .returning();

  return NextResponse.json({ dashboard: row });
}

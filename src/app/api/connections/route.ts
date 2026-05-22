import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connections } from "@/drizzle/schema";
import { requireAnalyst, jsonError } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/encryption";

const createSchema = z.object({
  name: z.string().min(1),
  host: z.string().min(1),
  port: z.string().default("5432"),
  database: z.string().min(1),
  user: z.string().min(1),
  password: z.string().min(1),
});

export async function GET() {
  const session = await requireAnalyst();
  if (session instanceof NextResponse) return session;

  const rows = await db
    .select({
      id: connections.id,
      name: connections.name,
      host: connections.host,
      port: connections.port,
      database: connections.database,
      username: connections.username,
      createdAt: connections.createdAt,
    })
    .from(connections)
    .where(eq(connections.userId, session.sub));

  return NextResponse.json({
    connections: [{ id: "demo", name: "Demo (POSTGRES_URL)", host: "default" }, ...rows],
  });
}

export async function POST(request: Request) {
  const session = await requireAnalyst();
  if (session instanceof NextResponse) return session;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Заполните поля подключения");

  const [row] = await db
    .insert(connections)
    .values({
      userId: session.sub,
      name: parsed.data.name,
      host: parsed.data.host,
      port: parsed.data.port,
      database: parsed.data.database,
      username: parsed.data.user,
      passwordEncrypted: encryptSecret(parsed.data.password),
    })
    .returning({ id: connections.id });

  return NextResponse.json({ id: row.id });
}

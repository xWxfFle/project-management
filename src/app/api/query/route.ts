import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAnalyst, jsonError } from "@/lib/api-utils";
import { resolveConnection } from "@/lib/connections";
import { executeOnConfig } from "@/lib/pg-data";
import { validateReadOnlySql } from "@/lib/sql-validator";

const schema = z.object({
  sql: z.string().min(1),
  connectionId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await requireAnalyst();
  if (session instanceof NextResponse) return session;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Тело запроса: { sql: string }");

  const validated = validateReadOnlySql(parsed.data.sql);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 403 });
  }

  const cfg = await resolveConnection(session, parsed.data.connectionId);
  if (!cfg) return jsonError("Подключение не найдено", 404);

  try {
    const result = await executeOnConfig(cfg, validated.sql);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка выполнения SQL";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

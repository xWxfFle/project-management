import { NextResponse } from "next/server";
import { requireAnalyst, jsonError } from "@/lib/api-utils";
import { resolveConnection } from "@/lib/connections";
import { fetchSchema } from "@/lib/pg-data";
import { schemaToJson, schemaToPromptText } from "@/lib/schema-export";

export async function GET(request: Request) {
  const session = await requireAnalyst();
  if (session instanceof NextResponse) return session;

  const connectionId =
    new URL(request.url).searchParams.get("connectionId") ?? undefined;

  const cfg = await resolveConnection(session, connectionId);
  if (!cfg) return jsonError("Подключение не найдено", 404);

  try {
    const columns = await fetchSchema(cfg);
    return NextResponse.json({
      tables: schemaToJson(columns),
      promptText: schemaToPromptText(columns),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка чтения схемы";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

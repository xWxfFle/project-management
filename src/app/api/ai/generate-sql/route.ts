import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAnalyst, jsonError } from "@/lib/api-utils";
import { resolveConnection } from "@/lib/connections";
import { fetchSchema } from "@/lib/pg-data";
import { schemaToPromptText } from "@/lib/schema-export";
import { generateSql, type AiMode } from "@/lib/ai/provider";
import { isAgentApiConfigured } from "@/lib/ai/agentapi";
import { buildPromptPreview } from "@/lib/ai/prompts";
import { db } from "@/lib/db";
import { aiHistory } from "@/drizzle/schema";

const schema = z.object({
  question: z.string().min(3),
  lang: z.enum(["ru", "en"]).default("ru"),
  connectionId: z.string().optional(),
  mode: z.enum(["mock", "agentapi"]).default("mock"),
});

export async function POST(request: Request) {
  const session = await requireAnalyst();
  if (session instanceof NextResponse) return session;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Укажите question");

  const mode = parsed.data.mode as AiMode;
  if (mode === "agentapi" && !isAgentApiConfigured()) {
    return jsonError(
      "AgentAPI не настроен. Добавьте AGENTAPI_KEY в .env",
      503,
    );
  }

  const cfg = await resolveConnection(session, parsed.data.connectionId);
  if (!cfg) return jsonError("Подключение не найдено", 404);

  let schemaText =
    "Table demo.sales: id int, category_id int, amount numeric, sold_at timestamptz\nTable demo.categories: id int, name varchar";
  try {
    const columns = await fetchSchema(cfg);
    schemaText = schemaToPromptText(columns);
  } catch {
    /* fallback */
  }

  const result = await generateSql(
    parsed.data.question,
    schemaText,
    parsed.data.lang,
    mode,
  );

  await db.insert(aiHistory).values({
    userId: session.sub,
    question: parsed.data.question,
    sql: result.sql,
    source: result.source,
  });

  const promptPreview = buildPromptPreview(
    schemaText,
    parsed.data.question,
    parsed.data.lang,
  );

  if (!result.sql) {
    return NextResponse.json({
      sql: null,
      source: result.source,
      mode,
      message: result.message,
      raw: result.raw,
      promptPreview: promptPreview.slice(0, 1500),
    });
  }

  return NextResponse.json({
    sql: result.sql,
    source: result.source,
    mode,
    promptPreview: promptPreview.slice(0, 1500),
  });
}

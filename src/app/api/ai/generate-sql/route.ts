import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAnalyst, jsonError } from "@/lib/api-utils";
import { resolveConnection } from "@/lib/connections";
import { fetchSchema } from "@/lib/pg-data";
import { schemaToPromptText } from "@/lib/schema-export";
import { generateSql } from "@/lib/ai/provider";
import { db } from "@/lib/db";
import { aiHistory } from "@/drizzle/schema";
import { buildPrompt } from "@/lib/ai/mock-llm";

const schema = z.object({
  question: z.string().min(3),
  lang: z.enum(["ru", "en"]).default("ru"),
  connectionId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await requireAnalyst();
  if (session instanceof NextResponse) return session;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Укажите question");

  const cfg = await resolveConnection(session, parsed.data.connectionId);
  if (!cfg) return jsonError("Подключение не найдено", 404);

  let schemaText = "Table demo.sales: id, category_id, amount, sold_at\nTable demo.categories: id, name";
  try {
    const columns = await fetchSchema(cfg);
    schemaText = schemaToPromptText(columns);
  } catch {
    /* fallback schema for mock */
  }

  const result = await generateSql(parsed.data.question, schemaText);
  void buildPrompt(schemaText, parsed.data.question, parsed.data.lang);

  await db.insert(aiHistory).values({
    userId: session.sub,
    question: parsed.data.question,
    sql: result.sql,
    source: result.source,
  });

  if (!result.sql) {
    return NextResponse.json({
      sql: null,
      source: result.source,
      message: result.message,
      promptPreview: schemaText.slice(0, 500),
    });
  }

  return NextResponse.json({
    sql: result.sql,
    source: result.source,
    promptPreview: schemaText.slice(0, 500),
  });
}

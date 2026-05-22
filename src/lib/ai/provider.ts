import { config } from "@/lib/config";
import { generateSqlFromQuestion } from "./mock-llm";

export async function generateSql(question: string, schemaText: string) {
  if (config.aiProvider === "openai") {
    return {
      sql: null as string | null,
      source: "fallback" as const,
      message: "OpenAI провайдер не настроен. Используйте AI_PROVIDER=mock.",
    };
  }
  void schemaText;
  return generateSqlFromQuestion(question);
}

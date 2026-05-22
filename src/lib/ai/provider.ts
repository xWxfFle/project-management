import { config } from "@/lib/config";
import { generateSqlViaAgentApi } from "./agentapi";
import { generateSqlFromQuestion } from "./mock-llm";
import type { PromptLang } from "./prompts";

export type AiMode = "mock" | "agentapi";

export type GenerateSqlResult = {
  sql: string | null;
  source: string;
  message?: string;
  raw?: string;
};

export async function generateSql(
  question: string,
  schemaText: string,
  lang: PromptLang,
  mode: AiMode = "mock",
): Promise<GenerateSqlResult> {
  if (mode === "agentapi") {
    return generateSqlViaAgentApi(question, schemaText, lang);
  }
  return generateSqlFromQuestion(question);
}

export function getDefaultAiMode(): AiMode {
  if (config.aiProvider === "agentapi") return "agentapi";
  return "mock";
}

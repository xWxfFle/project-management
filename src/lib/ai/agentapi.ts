import { config } from "@/lib/config";
import {
  buildAgentApiMessages,
  type PromptLang,
} from "./prompts";
import { extractSqlFromLlmResponse } from "./extract-sql";

export type AgentApiResult = {
  sql: string | null;
  source: "agentapi" | "fallback";
  message?: string;
  raw?: string;
};

export function isAgentApiConfigured() {
  return Boolean(config.agentApiKey);
}

export async function generateSqlViaAgentApi(
  question: string,
  schemaText: string,
  lang: PromptLang,
): Promise<AgentApiResult> {
  if (!config.agentApiKey) {
    return {
      sql: null,
      source: "fallback",
      message:
        "AgentAPI не настроен: добавьте AGENTAPI_KEY в переменные окружения.",
    };
  }

  const messages = buildAgentApiMessages(schemaText, question, lang);

  try {
    const response = await fetch(config.agentApiUrl, {
      method: "POST",
      headers: {
        "x-api-key": config.agentApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.agentApiModel,
        messages,
        temperature: 0.1,
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        sql: null,
        source: "fallback",
        message: `Ошибка AgentAPI (${response.status}): ${errText.slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const sql = extractSqlFromLlmResponse(content);

    if (!sql) {
      return {
        sql: null,
        source: "fallback",
        message:
          "ИИ не смог построить корректный SQL. Попробуйте уточнить запрос или отредактируйте SQL вручную.",
        raw: content.slice(0, 500),
      };
    }

    return { sql, source: "agentapi", raw: content.slice(0, 300) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Сбой сети AgentAPI";
    return {
      sql: null,
      source: "fallback",
      message: `AgentAPI недоступен: ${message}`,
    };
  }
}

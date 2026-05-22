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

function resolveAgentApiUrl() {
  const url = config.agentApiUrl.trim();
  if (url.includes("agentapi.ru/v1/chat/completions") && !url.includes("api.agentapi.ru")) {
    return "https://api.agentapi.ru/v1/ai/chat/completions";
  }
  return url;
}

async function parseAgentApiResponse(response: Response): Promise<AgentApiResult | { ok: true; content: string }> {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (
    text.trimStart().startsWith("<!DOCTYPE") ||
    text.trimStart().startsWith("<html") ||
    contentType.includes("text/html")
  ) {
    return {
      sql: null,
      source: "fallback",
      message:
        "AgentAPI вернул HTML вместо JSON. Укажите AGENTAPI_URL=https://api.agentapi.ru/v1/ai/chat/completions (не agentapi.ru).",
      raw: text.slice(0, 200),
    };
  }

  let data: { choices?: { message?: { content?: string } }[]; message?: string; error?: string };
  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    return {
      sql: null,
      source: "fallback",
      message: `AgentAPI: невалидный JSON (HTTP ${response.status})`,
      raw: text.slice(0, 300),
    };
  }

  if (!response.ok) {
    const errMsg = data.message ?? data.error ?? text.slice(0, 200);
    return {
      sql: null,
      source: "fallback",
      message: `Ошибка AgentAPI (${response.status}): ${errMsg}`,
    };
  }

  const content = data.choices?.[0]?.message?.content ?? "";
  return { ok: true, content };
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
  const url = resolveAgentApiUrl();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": config.agentApiKey.trim(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: config.agentApiModel,
        messages,
      }),
      signal: AbortSignal.timeout(25000),
    });

    const parsed = await parseAgentApiResponse(response);
    if (!("ok" in parsed && parsed.ok)) {
      return parsed as AgentApiResult;
    }

    const sql = extractSqlFromLlmResponse(parsed.content);
    if (!sql) {
      return {
        sql: null,
        source: "fallback",
        message:
          "ИИ не смог построить корректный SQL. Попробуйте уточнить запрос или отредактируйте SQL вручную.",
        raw: parsed.content.slice(0, 500),
      };
    }

    return { sql, source: "agentapi", raw: parsed.content.slice(0, 300) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Сбой сети AgentAPI";
    return {
      sql: null,
      source: "fallback",
      message: `AgentAPI недоступен: ${message}`,
    };
  }
}

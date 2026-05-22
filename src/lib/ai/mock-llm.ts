import { goldenExamples } from "./golden";

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
}

export type MockLlmResult = {
  sql: string | null;
  source: "golden" | "fallback";
  message?: string;
};

export function generateSqlFromQuestion(question: string): MockLlmResult {
  const q = normalize(question);
  for (const ex of goldenExamples) {
    const hit = ex.keywords.every((kw) => q.includes(kw));
    if (hit) return { sql: ex.sql, source: "golden" };
  }
  return {
    sql: null,
    source: "fallback",
    message:
      "ИИ не смог построить корректный SQL. Попробуйте уточнить запрос или отредактируйте SQL вручную. Примеры: «Покажи продажи по категориям за последний квартал».",
  };
}

export function buildPrompt(schemaText: string, question: string, lang: "ru" | "en") {
  const header =
    lang === "ru"
      ? "Ты генератор SQL. Ответь ТОЛЬКО одним SELECT для PostgreSQL."
      : "You are an SQL generator. Reply with ONE SELECT for PostgreSQL only.";
  return `${header}\n\nSchema:\n${schemaText}\n\nQuestion:\n${question}`;
}

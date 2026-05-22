import { goldenExamples } from "./golden";

export type PromptLang = "ru" | "en";

const SYSTEM_RU = `Ты эксперт по PostgreSQL и бизнес-аналитике. Твоя задача — по описанию на русском языке сгенерировать ОДИН корректный SQL-запрос.

Строгие правила:
- Только оператор SELECT (без INSERT, UPDATE, DELETE, DDL).
- Один запрос, без точки с запятой в конце.
- Используй только таблицы и колонки из переданной схемы (схемы demo и app).
- Для агрегаций указывай GROUP BY.
- Добавь LIMIT 100, если пользователь не указал иной лимит.
- «Продажи» = SUM(sales.amount), «категория» = categories.name.
- «Последний квартал» = предыдущий полный календарный квартал относительно CURRENT_DATE.
- Ответ: ТОЛЬКО текст SQL, без пояснений, без markdown, без обрамления.`;

const SYSTEM_EN = `You are a PostgreSQL and BI expert. Generate ONE valid SQL query from the user question.

Strict rules:
- SELECT only (no INSERT, UPDATE, DELETE, DDL).
- Single statement, no trailing semicolon.
- Use only tables/columns from the provided schema (demo and app schemas).
- Include GROUP BY for aggregations.
- Add LIMIT 100 unless the user specifies otherwise.
- "Sales" = SUM(sales.amount), "category" = categories.name.
- "Last quarter" = previous full calendar quarter relative to CURRENT_DATE.
- Reply with SQL text ONLY, no explanations, no markdown.`;

function fewShotExamples(lang: PromptLang) {
  return goldenExamples
    .filter((e) => e.lang === lang)
    .slice(0, 3)
    .map((e) => {
      const q =
        lang === "ru"
          ? `Пример: ключевые слова [${e.keywords.join(", ")}]`
          : `Example: keywords [${e.keywords.join(", ")}]`;
      return { question: q, sql: e.sql.trim() };
    });
}

export function buildAgentApiMessages(
  schemaText: string,
  question: string,
  lang: PromptLang,
) {
  const system = lang === "ru" ? SYSTEM_RU : SYSTEM_EN;
  const shots = fewShotExamples(lang);

  const examplesBlock = shots
    .map(
      (s, i) =>
        `${lang === "ru" ? "Пример" : "Example"} ${i + 1}:\nВопрос: ${s.question}\nSQL:\n${s.sql}`,
    )
    .join("\n\n");

  const userContent =
    lang === "ru"
      ? `Схема базы данных:\n${schemaText}\n\n${examplesBlock}\n\nВопрос пользователя:\n${question}\n\nSQL:`
      : `Database schema:\n${schemaText}\n\n${examplesBlock}\n\nUser question:\n${question}\n\nSQL:`;

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: userContent },
  ];
}

export function buildPromptPreview(
  schemaText: string,
  question: string,
  lang: PromptLang,
) {
  const messages = buildAgentApiMessages(schemaText, question, lang);
  return messages.map((m) => `[${m.role}]\n${m.content}`).join("\n\n---\n\n");
}

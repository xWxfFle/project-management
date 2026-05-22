"use client";

import { useEffect, useState } from "react";
import { ResultsTable } from "@/components/ResultsTable";
import { ResultsChart } from "@/components/ResultsChart";

type QueryResult = { columns: string[]; rows: unknown[][] };
type AiMode = "mock" | "agentapi";

export default function AnalyzePage() {
  const [question, setQuestion] = useState(
    "Покажи продажи по категориям за последний квартал",
  );
  const [sql, setSql] = useState("");
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [title, setTitle] = useState("Продажи по категориям");
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [mode, setMode] = useState<AiMode>("mock");
  const [agentApiReady, setAgentApiReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptPreview, setPromptPreview] = useState("");

  useEffect(() => {
    fetch("/api/ai/config")
      .then((r) => r.json())
      .then((data) => {
        setAgentApiReady(Boolean(data.agentApiConfigured));
        if (data.defaultMode === "agentapi" && data.agentApiConfigured) {
          setMode("agentapi");
        }
      })
      .catch(() => setAgentApiReady(false));
  }, []);

  async function generateSqlHandler() {
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang, mode }),
      });
      const data = await res.json();
      if (data.promptPreview) setPromptPreview(data.promptPreview);
      if (!res.ok) {
        setMsg(data.error ?? "Ошибка генерации");
        return;
      }
      if (data.sql) {
        setSql(data.sql);
        setMsg(`Источник: ${data.source} (режим: ${data.mode})`);
      } else {
        setMsg(
          [data.message, data.raw ? `Ответ модели: ${data.raw}` : ""]
            .filter(Boolean)
            .join("\n"),
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function runSql() {
    setMsg("");
    const res = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Ошибка SQL");
      return;
    }
    setResult({ columns: data.columns, rows: data.rows });
  }

  async function loadSample() {
    const res = await fetch("/sample-result.json");
    setResult(await res.json());
    setMsg("Загружены тестовые данные из sample-result.json");
  }

  async function saveDashboard() {
    if (!result) return;
    const res = await fetch("/api/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, sql, snapshot: result }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Дашборд сохранён: ${data.dashboard.id}` : data.error);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-xl font-semibold">Анализ: NL → SQL → таблица + график</h1>

      <section className="rounded border border-zinc-200 p-4 dark:border-zinc-700">
        <p className="mb-3 text-sm font-medium">Режим генерации SQL (тест)</p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="ai-mode"
              checked={mode === "mock"}
              onChange={() => setMode("mock")}
            />
            Mock (golden-примеры)
          </label>
          <label
            className={`flex items-center gap-2 text-sm ${!agentApiReady ? "opacity-50" : ""}`}
          >
            <input
              type="radio"
              name="ai-mode"
              checked={mode === "agentapi"}
              onChange={() => setMode("agentapi")}
              disabled={!agentApiReady}
            />
            AgentAPI (нейросеть)
          </label>
          <select
            className="rounded border px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            value={lang}
            onChange={(e) => setLang(e.target.value as "ru" | "en")}
          >
            <option value="ru">Промпт RU</option>
            <option value="en">Промпт EN</option>
          </select>
        </div>
        {!agentApiReady && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            AgentAPI: добавьте AGENTAPI_KEY в .env и перезапустите dev-сервер
          </p>
        )}
      </section>

      <section className="space-y-2">
        <label className="text-sm font-medium">Вопрос на естественном языке</label>
        <textarea
          className="w-full rounded border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generateSqlHandler}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {loading
              ? "Генерация…"
              : mode === "agentapi"
                ? "Сгенерировать SQL (AgentAPI)"
                : "Сгенерировать SQL (mock)"}
          </button>
          <button
            type="button"
            onClick={() => setShowPrompt(!showPrompt)}
            className="rounded border px-3 py-2 text-sm"
          >
            {showPrompt ? "Скрыть промпт" : "Показать промпт"}
          </button>
        </div>
        {showPrompt && promptPreview && (
          <pre className="max-h-48 overflow-auto rounded bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
            {promptPreview}
          </pre>
        )}
      </section>

      <section className="space-y-2">
        <label className="text-sm font-medium">SQL (можно редактировать)</label>
        <textarea
          className="w-full rounded border px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
          rows={8}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={runSql} className="rounded border px-4 py-2 text-sm">
            Выполнить
          </button>
          <button onClick={loadSample} className="rounded border px-4 py-2 text-sm">
            JSON-пример
          </button>
        </div>
      </section>

      {msg && (
        <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
          {msg}
        </p>
      )}

      {result && (
        <section className="space-y-4">
          <ResultsChart columns={result.columns} rows={result.rows} />
          <ResultsTable columns={result.columns} rows={result.rows} />
          <div className="flex gap-2">
            <input
              className="flex-1 rounded border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              onClick={saveDashboard}
              className="rounded bg-green-600 px-4 py-2 text-sm text-white"
            >
              Сохранить дашборд
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

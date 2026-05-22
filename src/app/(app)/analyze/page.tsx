"use client";

import { useState } from "react";
import { ResultsTable } from "@/components/ResultsTable";
import { ResultsChart } from "@/components/ResultsChart";

type QueryResult = { columns: string[]; rows: unknown[][] };

export default function AnalyzePage() {
  const [question, setQuestion] = useState(
    "Покажи продажи по категориям за последний квартал",
  );
  const [sql, setSql] = useState("");
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [title, setTitle] = useState("Продажи по категориям");

  async function generateSql() {
    setMsg("");
    const res = await fetch("/api/ai/generate-sql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, lang: "ru" }),
    });
    const data = await res.json();
    if (data.sql) {
      setSql(data.sql);
      setMsg(`Источник: ${data.source}`);
    } else {
      setMsg(data.message ?? "Не удалось сгенерировать SQL");
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

      <section className="space-y-2">
        <label className="text-sm font-medium">Вопрос на естественном языке</label>
        <textarea
          className="w-full rounded border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={generateSql}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
        >
          Сгенерировать SQL (mock)
        </button>
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

      {msg && <p className="text-sm text-zinc-600 dark:text-zinc-400">{msg}</p>}

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

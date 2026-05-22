"use client";

import { useState } from "react";

export default function ConnectPage() {
  const [form, setForm] = useState({
    name: "External PG",
    host: "localhost",
    port: "5432",
    database: "postgres",
    user: "postgres",
    password: "",
  });
  const [msg, setMsg] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Ошибка");
      return;
    }
    await fetch("/api/auth/active-connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: data.id }),
    });
    setMsg("Подключение сохранено. Пароль хранится только на сервере (шифрование).");
  }

  async function useDemo() {
    await fetch("/api/auth/active-connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: "demo" }),
    });
    setMsg("Активно демо-подключение (POSTGRES_URL, schema demo).");
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">Подключение к PostgreSQL</h1>
      <button
        type="button"
        onClick={useDemo}
        className="mb-4 rounded border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        Использовать демо (Vercel Postgres)
      </button>
      <form onSubmit={save} className="grid gap-3">
        {(["name", "host", "port", "database", "user"] as const).map((k) => (
          <input
            key={k}
            className="rounded border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            placeholder={k}
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          />
        ))}
        <input
          type="password"
          className="rounded border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          placeholder="password (не сохраняется в браузере)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Сохранить подключение
        </button>
      </form>
      {msg && <p className="mt-3 text-sm text-green-700 dark:text-green-400">{msg}</p>}
    </div>
  );
}

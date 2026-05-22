"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("analyst@demo.local");
  const [password, setPassword] = useState("analyst123");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Ошибка входа");
      return;
    }
    const data = await res.json();
    router.push(data.role === "viewer" ? "/dashboards" : "/analyze");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <h1 className="mb-6 text-2xl font-semibold">BI Platform</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          className="rounded border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          type="password"
          className="rounded border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Войти
        </button>
      </form>
      <p className="mt-4 text-xs text-zinc-500">
        analyst@demo.local / analyst123 · viewer@demo.local / viewer123
      </p>
    </main>
  );
}

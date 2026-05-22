import Link from "next/link";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { dashboards } from "@/drizzle/schema";
import { desc } from "drizzle-orm";

export default async function DashboardsPage() {
  const rows = await db
    .select({ id: dashboards.id, title: dashboards.title, createdAt: dashboards.createdAt })
    .from(dashboards)
    .orderBy(desc(dashboards.createdAt));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold">Дашборды</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Нет сохранённых дашбордов</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((d) => (
            <li key={d.id}>
              <Link
                href={`/dashboards/${d.id}`}
                className="text-blue-600 hover:underline"
              >
                {d.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

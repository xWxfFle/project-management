import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { dashboards } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { ResultsTable } from "@/components/ResultsTable";
import { ResultsChart } from "@/components/ResultsChart";

export default async function DashboardViewPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db.select().from(dashboards).where(eq(dashboards.id, id)).limit(1);
  const dash = rows[0];
  if (!dash) notFound();

  const snapshot = dash.snapshot as { columns: string[]; rows: unknown[][] };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="text-xl font-semibold">{dash.title}</h1>
      <p className="font-mono text-xs text-zinc-500">{dash.sql}</p>
      <ResultsChart columns={snapshot.columns} rows={snapshot.rows} />
      <ResultsTable columns={snapshot.columns} rows={snapshot.rows} />
    </div>
  );
}

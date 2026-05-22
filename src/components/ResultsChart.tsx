"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  columns: string[];
  rows: unknown[][];
};

function pickAxes(columns: string[], rows: unknown[][]) {
  const labelIdx = columns.findIndex((_, i) =>
    rows.some((r) => typeof r[i] === "string"),
  );
  const valueIdx = columns.findIndex((_, i) =>
    rows.some((r) => typeof r[i] === "number"),
  );
  return {
    label: labelIdx >= 0 ? labelIdx : 0,
    value: valueIdx >= 0 ? valueIdx : 1,
  };
}

export function ResultsChart({ columns, rows }: Props) {
  const { label, value } = pickAxes(columns, rows);
  const data = rows.map((r) => ({
    name: String(r[label] ?? ""),
    value: Number(r[value] ?? 0),
  }));

  if (!data.length) return null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

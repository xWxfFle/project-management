type Props = {
  columns: string[];
  rows: unknown[][];
};

export function ResultsTable({ columns, rows }: Props) {
  if (!columns.length) {
    return <p className="text-sm text-zinc-500">Нет данных</p>;
  }
  return (
    <div className="overflow-auto rounded border border-zinc-200 dark:border-zinc-700">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-zinc-200 dark:border-zinc-700">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2">
                  {String(cell ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

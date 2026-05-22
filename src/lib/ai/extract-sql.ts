export function extractSqlFromLlmResponse(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const codeBlock = trimmed.match(/```(?:sql)?\s*([\s\S]*?)```/i);
  if (codeBlock?.[1]) {
    const inner = codeBlock[1].trim();
    if (/^\s*select\b/i.test(inner)) return inner;
  }

  const selectMatch = trimmed.match(/(SELECT[\s\S]*)/i);
  if (selectMatch?.[1]) {
    let sql = selectMatch[1].trim();
    sql = sql.replace(/;+\s*$/, "");
    return sql;
  }

  return null;
}

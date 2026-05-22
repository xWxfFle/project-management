import { Parser } from "node-sql-parser";
import { config } from "./config";

const FORBIDDEN =
  /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE|COPY|CALL|EXECUTE|MERGE|REPLACE)\b/i;

const parser = new Parser();

export type SqlValidationResult =
  | { ok: true; sql: string }
  | { ok: false; error: string };

function hasMultipleStatements(sql: string) {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    if (ch === '"' && !inSingle) inDouble = !inDouble;
    if (ch === ";" && !inSingle && !inDouble && i < sql.length - 1) {
      const rest = sql.slice(i + 1).trim();
      if (rest.length > 0) return true;
    }
  }
  return false;
}

function ensureLimit(sql: string, maxRows: number) {
  if (/\blimit\s+\d+/i.test(sql)) return sql;
  return `${sql.replace(/;\s*$/, "")} LIMIT ${maxRows}`;
}

export function validateReadOnlySql(rawSql: string): SqlValidationResult {
  const sql = rawSql.trim();
  if (!sql) return { ok: false, error: "Пустой SQL-запрос" };
  if (hasMultipleStatements(sql)) {
    return { ok: false, error: "Разрешён только один SQL-запрос" };
  }
  if (FORBIDDEN.test(sql)) {
    return {
      ok: false,
      error: "Разрешены только SELECT-запросы (DDL/DML запрещены)",
    };
  }

  try {
    const ast = parser.astify(sql, { database: "PostgreSQL" });
    const statements = Array.isArray(ast) ? ast : [ast];
    if (statements.length !== 1 || statements[0].type !== "select") {
      return { ok: false, error: "Разрешены только SELECT-запросы" };
    }
  } catch {
    if (!/^\s*select\b/i.test(sql)) {
      return { ok: false, error: "Не удалось разобрать запрос как SELECT" };
    }
  }

  return { ok: true, sql: ensureLimit(sql, config.sqlMaxRows) };
}

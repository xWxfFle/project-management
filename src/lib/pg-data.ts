import { Client } from "pg";
import { decryptSecret } from "./encryption";
import { config } from "./config";
import { validateReadOnlySql } from "./sql-validator";

export type QueryResult = {
  columns: string[];
  rows: unknown[][];
};

export type ConnectionConfig = {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  schema?: string;
};

export function buildConnectionString(c: ConnectionConfig) {
  const port = c.port || "5432";
  return `postgresql://${encodeURIComponent(c.username)}:${encodeURIComponent(c.password)}@${c.host}:${port}/${encodeURIComponent(c.database)}`;
}

export function defaultDemoConfig(): ConnectionConfig | null {
  const url = process.env.POSTGRES_URL;
  if (!url) return null;
  return {
    host: "default",
    port: "5432",
    database: "default",
    username: "",
    password: url,
    schema: "demo",
  };
}

async function runWithClient(
  client: Client,
  sql: string,
  schema?: string,
): Promise<QueryResult> {
  const validated = validateReadOnlySql(sql);
  if (!validated.ok) throw new Error(validated.error);

  await client.connect();
  try {
    await client.query(`SET statement_timeout = ${config.sqlTimeoutMs}`);
    if (schema) await client.query(`SET search_path TO ${schema}, public`);
    const result = await client.query(validated.sql);
    const columns = result.fields.map((f) => f.name);
    const rows = result.rows.map((row) =>
      columns.map((col) => row[col] as unknown),
    );
    return { columns, rows };
  } finally {
    await client.end();
  }
}

export async function executeOnUrl(
  connectionUrl: string,
  sql: string,
  schema?: string,
): Promise<QueryResult> {
  const client = new Client({
    connectionString: connectionUrl,
    ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  return runWithClient(client, sql, schema);
}

export async function executeOnConfig(
  cfg: ConnectionConfig,
  sql: string,
): Promise<QueryResult> {
  if (cfg.host === "default" && cfg.password.startsWith("postgres")) {
    return executeOnUrl(cfg.password, sql, cfg.schema ?? "demo");
  }
  const client = new Client({
    host: cfg.host,
    port: Number(cfg.port) || 5432,
    database: cfg.database,
    user: cfg.username,
    password: cfg.password,
    ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  return runWithClient(client, sql);
}

export async function fetchSchema(
  cfg: ConnectionConfig,
  schemas = ["demo", "public"],
) {
  const run = async (client: Client) => {
    await client.connect();
    try {
      const res = await client.query(
        `SELECT table_schema, table_name, column_name, data_type
         FROM information_schema.columns
         WHERE table_schema = ANY($1::text[])
         ORDER BY table_schema, table_name, ordinal_position`,
        [schemas],
      );
      return res.rows as {
        table_schema: string;
        table_name: string;
        column_name: string;
        data_type: string;
      }[];
    } finally {
      await client.end();
    }
  };

  if (cfg.host === "default") {
    const client = new Client({ connectionString: cfg.password });
    return run(client);
  }

  const client = new Client({
    host: cfg.host,
    port: Number(cfg.port) || 5432,
    database: cfg.database,
    user: cfg.username,
    password: cfg.password,
  });
  return run(client);
}

export function connectionFromEncrypted(row: {
  host: string;
  port: string;
  database: string;
  username: string;
  passwordEncrypted: string;
}): ConnectionConfig {
  return {
    host: row.host,
    port: row.port,
    database: row.database,
    username: row.username,
    password: decryptSecret(row.passwordEncrypted),
  };
}

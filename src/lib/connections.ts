import { eq } from "drizzle-orm";
import { connections } from "@/drizzle/schema";
import { db } from "./db";
import {
  connectionFromEncrypted,
  defaultDemoConfig,
  type ConnectionConfig,
} from "./pg-data";
import type { SessionPayload } from "./auth";

export async function resolveConnection(
  session: SessionPayload,
  connectionId?: string | null,
): Promise<ConnectionConfig | null> {
  const id = connectionId ?? session.connectionId;
  if (!id || id === "demo") return defaultDemoConfig();

  const rows = await db
    .select()
    .from(connections)
    .where(eq(connections.id, id))
    .limit(1);

  const row = rows[0];
  if (!row || row.userId !== session.sub) return null;
  return connectionFromEncrypted(row);
}

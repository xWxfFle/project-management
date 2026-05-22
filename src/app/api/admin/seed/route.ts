import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { config } from "@/lib/config";

export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (secret !== config.seedSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: "POSTGRES_URL missing" }, { status: 500 });
  }

  const ddl = readFileSync(
    join(process.cwd(), "scripts", "seed-demo.sql"),
    "utf8",
  );
  await sql.query(ddl);

  const analystHash = await bcrypt.hash("analyst123", 10);
  const viewerHash = await bcrypt.hash("viewer123", 10);
  await sql.query(
    `INSERT INTO app.users (email, password_hash, role)
     VALUES ($1, $2, 'analyst'), ($3, $4, 'viewer')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ["analyst@demo.local", analystHash, "viewer@demo.local", viewerHash],
  );

  return NextResponse.json({ ok: true });
}

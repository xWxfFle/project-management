import { readFileSync } from "fs";
import { join } from "path";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error("POSTGRES_URL is required");
    process.exit(1);
  }

  const ddl = readFileSync(join(process.cwd(), "scripts", "seed-demo.sql"), "utf8");
  await sql.query(ddl);

  const analystHash = await bcrypt.hash("analyst123", 10);
  const viewerHash = await bcrypt.hash("viewer123", 10);

  await sql.query(`
    INSERT INTO app.users (email, password_hash, role)
    VALUES ($1, $2, 'analyst'), ($3, $4, 'viewer')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
  `, ["analyst@demo.local", analystHash, "viewer@demo.local", viewerHash]);

  console.log("Seed OK: demo schema + users analyst@demo.local / viewer@demo.local");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

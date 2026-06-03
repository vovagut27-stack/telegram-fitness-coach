import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./index.js";

let migrated = false;

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
}

export async function runMigrations(): Promise<void> {
  if (migrated) {
    return;
  }
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const schemaSql = await fs.readFile(path.join(dir, "schema.sql"), "utf8");
  const fixesSql = await fs.readFile(path.join(dir, "fixes.sql"), "utf8");

  for (const stmt of splitSqlStatements(schemaSql)) {
    try {
      await db.query(stmt);
    } catch (err) {
      console.warn("schema migration:", stmt.slice(0, 60), err);
    }
  }

  for (const stmt of splitSqlStatements(fixesSql)) {
    try {
      await db.query(stmt);
    } catch (err) {
      console.warn("fixes migration:", stmt.slice(0, 60), err);
    }
  }

  migrated = true;
  console.log("Database schema ready.");
}

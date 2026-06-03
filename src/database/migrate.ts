import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./index.js";

let migrated = false;

export async function runMigrations(): Promise<void> {
  if (migrated) {
    return;
  }
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const schemaSql = await fs.readFile(path.join(dir, "schema.sql"), "utf8");
  const fixesSql = await fs.readFile(path.join(dir, "fixes.sql"), "utf8");
  await db.query(schemaSql);
  await db.query(fixesSql);
  migrated = true;
  console.log("Database schema ready.");
}

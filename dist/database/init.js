import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./index.js";
async function run() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = await fs.readFile(schemaPath, "utf8");
    await db.query(sql);
    console.log("Database schema initialized.");
    await db.end();
}
void run();

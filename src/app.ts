import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.js";
import { bot, setupWebhook, webhookPath } from "./bot/index.js";
import { db } from "./database/index.js";
import { runMigrations } from "./database/migrate.js";

const app = express();
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.options(/.*/, cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "fitbot-backend", env: "ok" });
});

let dbReady: Promise<void> | null = null;
let webhookReady: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!dbReady) {
    dbReady = (async () => {
      await db.query("SELECT 1");
      await runMigrations();
    })();
  }
  return dbReady;
}

export function ensureWebhook(): Promise<void> {
  if (!webhookReady) {
    webhookReady = setupWebhook();
  }
  return webhookReady;
}

app.get("/api/health", async (_req, res) => {
  try {
    await ensureDb();
    const cols = await db.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'users'`,
    );
    const names = cols.rows.map((r) => r.column_name as string);
    const required = ["gender", "age", "weight_kg", "height_cm", "profile_complete"];
    const missing = required.filter((c) => !names.includes(c));
    res.json({
      ok: true,
      database: "connected",
      profileColumnsOk: missing.length === 0,
      missingColumns: missing,
    });
  } catch (err) {
    console.error("/api/health db error:", err);
    const message = err instanceof Error ? err.message : "unknown";
    res.status(500).json({ ok: false, database: "error", error: message });
  }
});

app.use("/api", apiRouter);

const hookPath = webhookPath();
app.post(hookPath, async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (err) {
    console.error("Webhook handler error:", err);
  } finally {
    if (!res.headersSent) {
      res.status(200).end();
    }
  }
});

export function ensureInitialized(): Promise<void> {
  return Promise.all([ensureDb(), ensureWebhook()]).then(() => undefined);
}

export default app;

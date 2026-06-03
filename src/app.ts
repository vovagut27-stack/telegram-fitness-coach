import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.js";
import { bot, setupWebhook, webhookPath } from "./bot/index.js";
import { db } from "./database/index.js";
import { runMigrations } from "./database/migrate.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "fitbot-backend" });
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
    res.json({ ok: true, database: "connected" });
  } catch (err) {
    console.error("/api/health db error:", err);
    res.status(500).json({ ok: false, database: "error" });
  }
});

app.use("/api", apiRouter);

const hookPath = webhookPath();
app.post(hookPath, async (req, res) => {
  try {
    await ensureDb();
    await bot.handleUpdate(req.body, res);
  } catch (err) {
    console.error("Webhook handler error:", err);
    if (!res.headersSent) {
      res.status(200).end();
    }
  }
});

export function ensureInitialized(): Promise<void> {
  return Promise.all([ensureDb(), ensureWebhook()]).then(() => undefined);
}

export default app;

import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.js";
import { bot, setupWebhook, webhookPath } from "./bot/index.js";
import { db } from "./database/index.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "fitbot-backend" });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", apiRouter);

const hookPath = webhookPath();
app.post(hookPath, (req, res) => {
  void bot.handleUpdate(req.body, res);
});

let dbReady: Promise<void> | null = null;
let webhookReady: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!dbReady) {
    dbReady = db.query("SELECT 1").then(() => undefined);
  }
  return dbReady;
}

export function ensureWebhook(): Promise<void> {
  if (!webhookReady) {
    webhookReady = setupWebhook();
  }
  return webhookReady;
}

export function ensureInitialized(): Promise<void> {
  return Promise.all([ensureDb(), ensureWebhook()]).then(() => undefined);
}

export default app;

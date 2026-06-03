import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const base = (process.env.APP_BASE_URL ?? "").replace(/\/+$/, "");
const secret = process.env.TELEGRAM_WEBHOOK_SECRET ?? "local-secret";
const webhookUrl = `${base}/telegram/webhook/${secret}`;

const missing = [];
if (!token) missing.push("TELEGRAM_BOT_TOKEN (or BOT_TOKEN)");
if (!base) missing.push("APP_BASE_URL");

if (missing.length > 0) {
  console.error("Missing in .env:", missing.join(", "));
  console.error("Save .env (Ctrl+S) and run: node scripts/set-webhook.mjs");
  process.exit(1);
}

const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: webhookUrl }),
});
console.log("setWebhook:", await setRes.json());

const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
console.log("getWebhookInfo:", await infoRes.json());

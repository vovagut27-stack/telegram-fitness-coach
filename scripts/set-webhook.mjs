import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
const base = (process.env.APP_BASE_URL ?? "").replace(/\/+$/, "");
const secret = process.env.TELEGRAM_WEBHOOK_SECRET ?? "local-secret";
const webhookUrl = `${base}/telegram/webhook/${secret}`;

if (!token || !base) {
  console.error("Set TELEGRAM_BOT_TOKEN and APP_BASE_URL in .env");
  process.exit(1);
}

const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: webhookUrl }),
});
const setJson = await setRes.json();
console.log("setWebhook:", setJson);

const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
const infoJson = await infoRes.json();
console.log("getWebhookInfo:", infoJson);

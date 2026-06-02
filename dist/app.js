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
app.use("/api", apiRouter);
app.use(webhookPath(), bot.webhookCallback(webhookPath()));
let initPromise = null;
export function ensureInitialized() {
    if (!initPromise) {
        initPromise = (async () => {
            await db.query("SELECT 1");
            await setupWebhook();
        })();
    }
    return initPromise;
}
export default app;

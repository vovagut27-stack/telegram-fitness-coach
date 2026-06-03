import { envConfigValid, envIssues } from "../src/config/env.js";

export default async function handler(req: any, res: any): Promise<void> {
  const path = (req.url ?? "/").split("?")[0];

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (!envConfigValid) {
    res.status(503).json({
      ok: false,
      error: "missing_environment_variables",
      details: envIssues,
      hint: "Set TELEGRAM_BOT_TOKEN, OPENAI_API_KEY, DATABASE_URL, APP_BASE_URL on Vercel.",
    });
    return;
  }

  const { default: app, ensureDb, ensureWebhook } = await import("../src/app.js");

  try {
    if (path === "/" || path === "/api/health") {
      return app(req, res);
    }

    if (req.method === "POST" && path.startsWith("/telegram/webhook/")) {
      await ensureDb();
      await ensureWebhook();
      return app(req, res);
    }

    if (path.startsWith("/api/")) {
      await ensureDb();
      return app(req, res);
    }

    await ensureDb();
    await ensureWebhook();
    return app(req, res);
  } catch (err) {
    console.error("Handler error:", err);
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: "Server initialization failed" });
    }
  }
}

import app, { ensureDb, ensureWebhook } from "../src/app.js";

export default async function handler(req: any, res: any): Promise<void> {
  const path = (req.url ?? "/").split("?")[0];

  try {
    if (path === "/" || path === "/api/health") {
      return app(req, res);
    }

    if (req.method === "POST" && path.startsWith("/telegram/webhook/")) {
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

import { envConfigValid, envIssues } from "../src/config/env.js";

let warmServices: Promise<{ default: unknown; ensureDb: () => Promise<void> }> | null = null;

function getAppModule() {
  if (!warmServices) {
    warmServices = import("../src/app.js") as Promise<{
      default: unknown;
      ensureDb: () => Promise<void>;
    }>;
    if (envConfigValid) {
      void warmServices.then((m) => m.ensureDb());
    }
  }
  return warmServices;
}

if (envConfigValid) {
  void getAppModule();
}

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

  const { default: app, ensureDb } = await getAppModule();

  try {
    if (path === "/" || path === "/api/health") {
      return (app as (req: unknown, res: unknown) => void)(req, res);
    }

    if (req.method === "POST" && path.startsWith("/telegram/webhook/")) {
      await ensureDb();
      return (app as (req: unknown, res: unknown) => void)(req, res);
    }

    if (path.startsWith("/api/")) {
      await ensureDb();
      return (app as (req: unknown, res: unknown) => void)(req, res);
    }

    await ensureDb();
    return (app as (req: unknown, res: unknown) => void)(req, res);
  } catch (err) {
    console.error("Handler error:", err);
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: "Server initialization failed" });
    }
  }
}

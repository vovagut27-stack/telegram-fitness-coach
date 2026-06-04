import type { Telegraf } from "telegraf";
import { env } from "../config/env.js";

export function normalizeWebAppUrl(): string | null {
  const url = env.WEBAPP_URL?.trim().replace(/\/+$/, "") ?? "";
  if (!url.startsWith("https://")) {
    return null;
  }
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("localhost")) {
      return null;
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** Кнопка «Меню» слева внизу в Telegram (Desktop + iOS + Android) — тот же Mini App. */
export async function setupTelegramMenuButton(bot: Telegraf): Promise<void> {
  const url = normalizeWebAppUrl();
  if (!url) {
    console.warn("WEBAPP_URL is not a public https URL — Telegram menu button skipped");
    return;
  }

  try {
    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: "web_app",
        text: "🏋️ FitBot",
        web_app: { url },
      },
    });
    console.log(`Telegram menu button → Mini App: ${url}`);
  } catch (err) {
    console.error("setChatMenuButton failed (non-fatal):", err);
  }
}

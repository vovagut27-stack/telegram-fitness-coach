import type { Telegraf } from "telegraf";
import { env } from "../config/env.js";
import { t } from "../i18n/index.js";

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

/** Список команд в меню «/» Telegram (ru + en). */
export async function setupBotCommands(bot: Telegraf): Promise<void> {
  const ru = [
    { command: "start", description: "Главное меню" },
    { command: "app", description: "Открыть приложение" },
    { command: "today", description: "Тренировка на сегодня" },
    { command: "plan", description: "План на неделю" },
    { command: "language", description: t("ru", "cmd_language_desc") },
    { command: "settings", description: "Настройки" },
    { command: "stats", description: "Статистика" },
    { command: "premium", description: "Premium" },
    { command: "support", description: "Поддержать создателя" },
    { command: "report", description: "Сообщить об ошибке" },
  ];
  const en = [
    { command: "start", description: "Main menu" },
    { command: "app", description: "Open app" },
    { command: "today", description: "Today's workout" },
    { command: "plan", description: "Weekly plan" },
    { command: "language", description: t("en", "cmd_language_desc") },
    { command: "settings", description: "Settings" },
    { command: "stats", description: "Stats" },
    { command: "premium", description: "Premium" },
    { command: "support", description: "Support the creator" },
    { command: "report", description: "Report a bug" },
  ];

  try {
    await bot.telegram.setMyCommands(ru, { language_code: "ru" });
    await bot.telegram.setMyCommands(en, { language_code: "en" });
    await bot.telegram.setMyCommands(en);
    console.log("Telegram bot commands registered");
  } catch (err) {
    console.error("setMyCommands failed (non-fatal):", err);
  }
}

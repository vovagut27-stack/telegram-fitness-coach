import { Markup } from "telegraf";
import { env } from "../../config/env.js";
import { t } from "../../i18n/index.js";
import type { Locale } from "../../types/locale.js";

function isValidWebAppUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.hostname.includes("localhost");
  } catch {
    return false;
  }
}

export function buildMainKeyboard(locale: Locale) {
  const rows = [];
  if (isValidWebAppUrl(env.WEBAPP_URL)) {
    rows.push([Markup.button.webApp(t(locale, "btn_open_app"), env.WEBAPP_URL)]);
  }
  rows.push([Markup.button.callback(t(locale, "btn_premium"), "buy_premium")]);
  return Markup.inlineKeyboard(rows);
}

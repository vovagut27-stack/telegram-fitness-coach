import { Markup } from "telegraf";
import { env } from "../../config/env.js";
import { t } from "../../i18n/index.js";
import type { Locale } from "../../types/locale.js";

/** Language + fitness level in one keyboard (visible in a single /start message). */
export function buildStartKeyboard(locale: Locale) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(`🇷🇺 ${t(locale, "lang_ru")}`, "set_lang_ru"),
      Markup.button.callback(`🇬🇧 ${t(locale, "lang_en")}`, "set_lang_en"),
    ],
    [Markup.button.callback(t(locale, "level_beginner"), "set_level_beginner")],
    [Markup.button.callback(t(locale, "level_intermediate"), "set_level_intermediate")],
    [Markup.button.callback(t(locale, "level_advanced"), "set_level_advanced")],
  ]);
}

export function buildLanguageKeyboard(locale: Locale) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(`🇷🇺 ${t(locale, "lang_ru")}`, "set_lang_ru"),
      Markup.button.callback(`🇬🇧 ${t(locale, "lang_en")}`, "set_lang_en"),
    ],
  ]);
}

export function buildLevelKeyboard(locale: Locale) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(locale, "level_beginner"), "set_level_beginner")],
    [Markup.button.callback(t(locale, "level_intermediate"), "set_level_intermediate")],
    [Markup.button.callback(t(locale, "level_advanced"), "set_level_advanced")],
  ]);
}

function isValidWebAppUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.hostname.includes("localhost");
  } catch {
    return false;
  }
}

export function buildTodayKeyboard(locale: Locale) {
  const rows = [];

  if (isValidWebAppUrl(env.WEBAPP_URL)) {
    rows.push([Markup.button.webApp(t(locale, "btn_start_workout"), env.WEBAPP_URL)]);
  }

  rows.push([Markup.button.callback(t(locale, "btn_regenerate"), "today_regenerate")]);
  return Markup.inlineKeyboard(rows);
}

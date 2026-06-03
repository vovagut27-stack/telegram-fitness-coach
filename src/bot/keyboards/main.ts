import { Markup } from "telegraf";
import { env } from "../../config/env.js";
import { t } from "../../i18n/index.js";
import type { Locale } from "../../types/locale.js";
import type { ScheduleDayItem } from "../../services/schedule-service.js";

function isValidWebAppUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.hostname.includes("localhost");
  } catch {
    return false;
  }
}

function webAppUrl(date?: string): string | null {
  if (!isValidWebAppUrl(env.WEBAPP_URL)) {
    return null;
  }
  if (!date) {
    return env.WEBAPP_URL;
  }
  const base = env.WEBAPP_URL.replace(/\/+$/, "");
  return `${base}?date=${date}`;
}

export function buildMainKeyboard(locale: Locale) {
  const rows = [];
  const appUrl = webAppUrl();
  if (appUrl) {
    rows.push([Markup.button.webApp(t(locale, "btn_open_app"), appUrl)]);
  }
  rows.push([Markup.button.callback(t(locale, "btn_plan"), "show_plan")]);
  rows.push([Markup.button.callback(t(locale, "btn_premium"), "buy_premium")]);
  return Markup.inlineKeyboard(rows);
}

export function buildPlanKeyboard(locale: Locale, days: ScheduleDayItem[]) {
  const rows = days.slice(0, 7).map((day) => {
    const label = `${day.dayLabel} · ${day.focusTitle}${day.completed ? " ✓" : ""}`;
    const url = webAppUrl(day.date);
    if (url) {
      return [Markup.button.webApp(label.slice(0, 64), url)];
    }
    return [Markup.button.callback(label.slice(0, 64), `noop_${day.date}`)];
  });
  return Markup.inlineKeyboard(rows);
}

export function buildQuickPlanText(locale: Locale, days: ScheduleDayItem[]): string {
  const lines = days.slice(0, 7).map((d) => {
    const mark = d.completed ? "✅" : "▫️";
    return `${mark} ${d.dayLabel}, ${d.focusTitle}`;
  });
  return [t(locale, "bot_plan_header"), "", ...lines].join("\n");
}

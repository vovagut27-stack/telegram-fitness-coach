import { Markup } from "telegraf";
import { env } from "../../config/env.js";

export const startKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("Beginner", "set_level_beginner")],
  [Markup.button.callback("Intermediate", "set_level_intermediate")],
  [Markup.button.callback("Advanced", "set_level_advanced")],
]);

function isValidWebAppUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.hostname.includes("localhost");
  } catch {
    return false;
  }
}

export function buildTodayKeyboard() {
  const rows = [];

  if (isValidWebAppUrl(env.WEBAPP_URL)) {
    rows.push([Markup.button.webApp("Start Workout", env.WEBAPP_URL)]);
  }

  rows.push([Markup.button.callback("Regenerate", "today_regenerate")]);
  return Markup.inlineKeyboard(rows);
}

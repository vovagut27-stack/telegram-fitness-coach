import { Markup } from "telegraf";
import type { Context } from "telegraf";
import { env } from "../../config/env.js";
import { t } from "../../i18n/index.js";
import { isoDateOnly } from "../../services/schedule-service.js";
import { getOrCreateWorkoutForDate } from "../../services/workout-service.js";
import { buildMainKeyboard } from "../keyboards/main.js";
import { getUserLocale } from "./start.js";

function webAppUrlForDate(date: string): string | null {
  const base = env.WEBAPP_URL?.replace(/\/+$/, "");
  if (!base?.startsWith("https://")) {
    return null;
  }
  return `${base}?date=${date}`;
}

export async function todayCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  const locale = await getUserLocale(telegramId);
  const date = isoDateOnly();

  try {
    const plan = await getOrCreateWorkoutForDate(telegramId, date);
    const url = webAppUrlForDate(date);
    const title = plan.splitDay ?? (locale === "ru" ? "Тренировка" : "Workout");
    const preview = plan.exercises
      .slice(0, 4)
      .map((e) => `· ${e.name}`)
      .join("\n");

    const lines = [
      t(locale, "bot_today_header", { date }),
      `📌 <b>${title}</b>`,
      preview,
      "",
      t(locale, "bot_today_footer"),
    ];

    const keyboard = url
      ? Markup.inlineKeyboard([[Markup.button.webApp(t(locale, "btn_open_today"), url)]])
      : buildMainKeyboard(locale);

    await ctx.reply(lines.join("\n"), {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      ...keyboard,
    });
  } catch (err) {
    console.error("/today failed:", err);
    await ctx.reply(t(locale, "bot_error_generic"), buildMainKeyboard(locale));
  }
}

import type { Context } from "telegraf";
import { buildMainKeyboard, buildPlanKeyboard, buildQuickPlanText } from "./keyboards/main.js";
import { getUserLocale } from "./commands/start.js";
import { t } from "../i18n/index.js";
import { ensureDefaultUser, getWeekPlanForBot } from "../services/workout-service.js";

export async function sendWeekPlan(ctx: Context, telegramId: number): Promise<void> {
  const locale = await getUserLocale(telegramId);
  try {
    await ensureDefaultUser(telegramId);
    const schedule = await getWeekPlanForBot(telegramId, 7);
    const text = buildQuickPlanText(locale, schedule);
    const keyboard = buildPlanKeyboard(locale, schedule);
    await ctx.reply(text, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      ...keyboard,
    });
  } catch (err) {
    console.error("sendWeekPlan failed:", err);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("timeout") || message.includes("connect")) {
      await ctx.reply(t(locale, "bot_db_not_ready"), buildMainKeyboard(locale));
      return;
    }
    await ctx.reply(t(locale, "bot_error_generic"), buildMainKeyboard(locale));
  }
}

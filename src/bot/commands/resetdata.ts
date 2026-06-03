import { Markup } from "telegraf";
import type { Context } from "telegraf";
import { resetUserPersonalData } from "../../database/reset-user-data.js";
import { t } from "../../i18n/index.js";
import { buildMainKeyboard } from "../keyboards/main.js";
import { getUserLocale } from "./start.js";

export const RESET_DATA_CONFIRM = "reset_data_yes";
export const RESET_DATA_CANCEL = "reset_data_no";

export function buildResetConfirmKeyboard(locale: "ru" | "en") {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(locale, "reset_data_btn_yes"), RESET_DATA_CONFIRM)],
    [Markup.button.callback(t(locale, "reset_data_btn_no"), RESET_DATA_CANCEL)],
  ]);
}

export async function resetDataCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  const locale = await getUserLocale(telegramId);
  await ctx.reply(t(locale, "reset_data_warning"), buildResetConfirmKeyboard(locale));
}

export async function resetDataConfirmAction(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  const locale = await getUserLocale(telegramId);
  await ctx.answerCbQuery().catch(() => undefined);

  try {
    const result = await resetUserPersonalData(telegramId);
    const premiumLine = result.premiumKept
      ? t(locale, "reset_data_premium_kept")
      : t(locale, "reset_data_premium_none");
    await ctx.editMessageText(
      [
        t(locale, "reset_data_done"),
        "",
        t(locale, "reset_data_stats", {
          workouts: String(result.workoutsDeleted),
          weights: String(result.weightLogsDeleted),
        }),
        premiumLine,
        "",
        t(locale, "reset_data_fill_profile"),
      ].join("\n"),
    );
    await ctx.reply(t(locale, "reset_data_restart"), buildMainKeyboard(locale));
  } catch (err) {
    console.error("reset_data_yes failed:", err);
    await ctx.reply(t(locale, "bot_error_generic"), buildMainKeyboard(locale));
  }
}

export async function resetDataCancelAction(ctx: Context): Promise<void> {
  const locale = await getUserLocale(ctx.from?.id ?? 0);
  await ctx.answerCbQuery(t(locale, "reset_data_cancelled_short")).catch(() => undefined);
  try {
    await ctx.editMessageText(t(locale, "reset_data_cancelled"));
  } catch {
    await ctx.reply(t(locale, "reset_data_cancelled"), buildMainKeyboard(locale));
  }
}

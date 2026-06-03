import type { Context } from "telegraf";
import { buildMainKeyboard, buildPlanKeyboard, buildQuickPlanText } from "./keyboards/main.js";
import { getUserLocale } from "./commands/start.js";
import { t } from "../i18n/index.js";
import { ensureDefaultUser, getWeekPlanForBot } from "../services/workout-service.js";

export async function sendWeekPlan(
  ctx: Context,
  telegramId: number,
  loadingMessageId?: number,
): Promise<void> {
  const locale = await getUserLocale(telegramId);
  const chatId = ctx.chat?.id;
  try {
    await ensureDefaultUser(telegramId);
    const schedule = await getWeekPlanForBot(telegramId, 7);
    const text = buildQuickPlanText(locale, schedule);
    const keyboard = buildPlanKeyboard(locale, schedule);
    const extra = {
      parse_mode: "HTML" as const,
      link_preview_options: { is_disabled: true },
      ...keyboard,
    };

    if (loadingMessageId != null && chatId != null) {
      try {
        await ctx.telegram.editMessageText(chatId, loadingMessageId, undefined, text, extra);
        return;
      } catch (editErr) {
        console.warn("editMessageText plan failed, sending new message:", editErr);
      }
    }

    await ctx.reply(text, extra);
  } catch (err) {
    console.error("sendWeekPlan failed:", err);
    const message = err instanceof Error ? err.message : "";
    const errorText =
      message.includes("timeout") || message.includes("connect")
        ? t(locale, "bot_db_not_ready")
        : t(locale, "bot_error_generic");

    if (loadingMessageId != null && chatId != null) {
      try {
        await ctx.telegram.editMessageText(
          chatId,
          loadingMessageId,
          undefined,
          errorText,
          buildMainKeyboard(locale),
        );
        return;
      } catch {
        /* fall through */
      }
    }
    await ctx.reply(errorText, buildMainKeyboard(locale));
  }
}

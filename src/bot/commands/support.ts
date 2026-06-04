import { Markup } from "telegraf";
import type { Context } from "telegraf";
import { CREATOR_DONATE_URL } from "../../config/creator-donate.js";
import { t } from "../../i18n/index.js";
import type { Locale } from "../../types/locale.js";
import { buildMainKeyboard } from "../keyboards/main.js";
import { getUserLocale } from "./start.js";
import { ensureLanguageChosen } from "./language.js";

export function buildSupportKeyboard(locale: Locale) {
  return Markup.inlineKeyboard([
    [Markup.button.url(t(locale, "btn_support_creator"), CREATOR_DONATE_URL)],
  ]);
}

export async function supportCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  if (!(await ensureLanguageChosen(ctx))) {
    return;
  }
  const locale = await getUserLocale(telegramId);
  const mainRows = buildMainKeyboard(locale).reply_markup.inline_keyboard;
  const supportRows = buildSupportKeyboard(locale).reply_markup.inline_keyboard;
  await ctx.reply(t(locale, "bot_support_message"), {
    parse_mode: "HTML",
    reply_markup: Markup.inlineKeyboard([...supportRows, ...mainRows]).reply_markup,
  });
}

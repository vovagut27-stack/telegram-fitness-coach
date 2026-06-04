import { Markup } from "telegraf";
import type { Context } from "telegraf";
import { getUser, setUserLanguage, userNeedsLanguagePick } from "../../database/users-repo.js";
import { t } from "../../i18n/index.js";
import type { Locale } from "../../types/locale.js";
import { ensureDefaultUser } from "../../services/workout-service.js";
import { buildMainKeyboard } from "../keyboards/main.js";
import { getUserLocale } from "./start.js";

export const LANG_PICK_RU = "lang_pick_ru";
export const LANG_PICK_EN = "lang_pick_en";
export const SHOW_LANGUAGE = "show_language";

export function buildLanguageKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🇷🇺 Русский", LANG_PICK_RU)],
    [Markup.button.callback("🇬🇧 English", LANG_PICK_EN)],
  ]);
}

/** Bilingual prompt when locale is not chosen yet. */
export function languagePickPromptText(): string {
  return "👋 FitBot\n\nВыберите язык / Choose your language:";
}

export async function promptChooseLanguage(ctx: Context): Promise<void> {
  await ctx.reply(languagePickPromptText(), buildLanguageKeyboard());
}

/** Returns false if user must pick language first. */
export async function ensureLanguageChosen(ctx: Context): Promise<boolean> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return false;
  }
  await ensureDefaultUser(telegramId);
  const user = await getUser(telegramId);
  if (userNeedsLanguagePick(user)) {
    await promptChooseLanguage(ctx);
    return false;
  }
  return true;
}

export async function languageCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  await ensureDefaultUser(telegramId);
  const user = await getUser(telegramId);
  if (userNeedsLanguagePick(user)) {
    await promptChooseLanguage(ctx);
    return;
  }
  const locale = await getUserLocale(telegramId);
  await ctx.reply(t(locale, "bot_language_change"), buildLanguageKeyboard());
}

export async function languagePickAction(ctx: Context, locale: Locale): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }

  await ctx.answerCbQuery().catch(() => undefined);
  await setUserLanguage(telegramId, locale);

  try {
    await ctx.editMessageText(t(locale, "bot_language_saved"));
  } catch {
    // message may be unchanged
  }

  await ctx.reply(t(locale, "bot_start_short"), buildMainKeyboard(locale));
}

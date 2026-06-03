import { Context } from "telegraf";
import { buildMainKeyboard } from "../keyboards/main.js";
import { t } from "../../i18n/index.js";
import { DEFAULT_LOCALE } from "../../types/locale.js";
import { ensureDefaultUser } from "../../services/workout-service.js";
import { getUser } from "../../database/users-repo.js";

export async function startCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  try {
    await ensureDefaultUser(telegramId);
    const user = await getUser(telegramId);
    const locale = user?.language ?? DEFAULT_LOCALE;
    await ctx.reply(t(locale, "bot_start_short"), buildMainKeyboard(locale));
  } catch (err) {
    console.error("/start failed:", err);
    await ctx.reply(t(DEFAULT_LOCALE, "bot_db_not_ready"));
  }
}

export async function getUserLocale(telegramId: number): Promise<typeof DEFAULT_LOCALE> {
  const user = await getUser(telegramId);
  return user?.language ?? DEFAULT_LOCALE;
}

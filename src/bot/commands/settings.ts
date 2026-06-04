import type { Context } from "telegraf";
import { t } from "../../i18n/index.js";
import { getUser } from "../../database/users-repo.js";
import { buildMainKeyboard } from "../keyboards/main.js";
import { getUserLocale } from "./start.js";

export async function settingsCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  const locale = await getUserLocale(telegramId);
  const user = await getUser(telegramId);
  const lines = [t(locale, "bot_settings_header"), ""];
  if (user?.remindersEnabled) {
    lines.push(t(locale, "bot_settings_reminders_on", { hour: String(user.reminderHour) }));
  } else {
    lines.push(t(locale, "bot_settings_reminders_off"));
  }
  lines.push("", t(locale, "bot_settings_hint"));
  await ctx.reply(lines.join("\n"), buildMainKeyboard(locale));
}

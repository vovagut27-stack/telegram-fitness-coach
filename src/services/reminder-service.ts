import { Telegraf } from "telegraf";
import { env } from "../config/env.js";
import { getWorkoutByDate } from "../database/workouts-repo.js";
import { listUsersWithReminders, type UserProfile } from "../database/users-repo.js";
import { t } from "../i18n/index.js";
import { isoDateOnly } from "./schedule-service.js";
import { getTodayWorkoutPreview } from "./workout-service.js";

function webAppUrlForDate(date: string): string | null {
  const base = env.WEBAPP_URL?.replace(/\/+$/, "");
  if (!base?.startsWith("https://")) {
    return null;
  }
  return `${base}?date=${date}`;
}

/** Local hour 0–23 for a given UTC hour and user offset (minutes east of UTC). */
export function localHourForUtc(utcHour: number, offsetMinutes: number): number {
  const total = ((utcHour * 60 + offsetMinutes) % (24 * 60) + 24 * 60) % (24 * 60);
  return Math.floor(total / 60);
}

export function userWantsReminderNow(user: UserProfile, utcHour: number): boolean {
  if (!user.remindersEnabled) {
    return false;
  }
  const local = localHourForUtc(utcHour, user.timezoneOffsetMinutes);
  return local === user.reminderHour;
}

export async function sendDailyReminders(bot: Telegraf): Promise<{
  scanned: number;
  sent: number;
  skipped: number;
}> {
  const utcHour = new Date().getUTCHours();
  const today = isoDateOnly();
  const candidates = await listUsersWithReminders();
  let sent = 0;
  let skipped = 0;

  for (const user of candidates) {
    if (!userWantsReminderNow(user, utcHour)) {
      skipped += 1;
      continue;
    }
    const row = await getWorkoutByDate(user.telegramId, today);
    if (row?.completed) {
      skipped += 1;
      continue;
    }

    try {
      const preview = await getTodayWorkoutPreview(user.telegramId, today);
      const title = preview.title;
      const url = webAppUrlForDate(today);
      const lines = [
        t(user.language, "reminder_message", { title }),
        "",
        preview.exerciseNames.map((name) => `· ${name}`).join("\n"),
      ];
      const extra = url
        ? {
            reply_markup: {
              inline_keyboard: [[{ text: t(user.language, "btn_open_today"), web_app: { url } }]],
            },
          }
        : {};

      await bot.telegram.sendMessage(user.telegramId, lines.join("\n"), {
        link_preview_options: { is_disabled: true },
        ...extra,
      });
      sent += 1;
    } catch (err) {
      console.warn(`reminder failed for ${user.telegramId}:`, err);
      skipped += 1;
    }
  }

  return { scanned: candidates.length, sent, skipped };
}

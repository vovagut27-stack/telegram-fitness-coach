import { Context, Telegraf } from "telegraf";
import { env } from "../config/env.js";
import { startCommand, getUserLocale } from "./commands/start.js";
import { buildLanguageKeyboard, buildTodayKeyboard } from "./keyboards/main.js";
import { deleteWorkoutByDate } from "../database/workouts-repo.js";
import { ensureDefaultUser, getOrCreateTodayWorkout } from "../services/workout-service.js";
import { getUser, setUserLanguage, upgradePremium, upsertUser } from "../database/users-repo.js";
import { levelLabel, t } from "../i18n/index.js";
import type { Locale } from "../types/locale.js";
import type { FitnessLevel } from "../types/workout.js";

export const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  void getUserLocale(ctx.from?.id ?? 0).then((locale) => {
    void ctx.reply(t(locale, "bot_error_generic"));
  });
});

bot.start(startCommand);

for (const lang of ["ru", "en"] as const) {
  bot.action(`set_lang_${lang}`, async (ctx) => {
    await ctx.answerCbQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      return;
    }
    try {
      await ensureDefaultUser(telegramId);
      await setUserLanguage(telegramId, lang);
      await ctx.reply(t(lang, "bot_lang_saved"));
    } catch (err) {
      console.error(`set_lang_${lang} failed:`, err);
      await ctx.reply(t(lang, "bot_error_generic"));
    }
  });
}

const levelActions: Record<string, FitnessLevel> = {
  set_level_beginner: "beginner",
  set_level_intermediate: "intermediate",
  set_level_advanced: "advanced",
};

for (const [action, level] of Object.entries(levelActions)) {
  bot.action(action, async (ctx) => {
    await ctx.answerCbQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      return;
    }
    const locale = await getUserLocale(telegramId);
    try {
      await ensureDefaultUser(telegramId);
      const user = await getUser(telegramId);
      await upsertUser({
        telegramId,
        fitnessLevel: level,
        availableEquipment: user?.availableEquipment ?? ["bodyweight"],
        goals: user?.goals ?? ["strength"],
        timePerSession: user?.timePerSession ?? 25,
        isPremium: user?.isPremium ?? false,
        language: user?.language ?? locale,
      });
      await ctx.reply(
        t(locale, "bot_level_saved", { level: levelLabel(locale, level) }),
      );
    } catch (err) {
      console.error(`Level action ${action} failed:`, err);
      await ctx.reply(t(locale, "bot_level_error"));
    }
  });
}

function formatWorkoutMessage(
  locale: Locale,
  plan: Awaited<ReturnType<typeof getOrCreateTodayWorkout>>,
): string {
  return [
    t(locale, "bot_workout_focus", { muscles: plan.targetMuscles.join(", ") }),
    t(locale, "bot_workout_duration", { minutes: plan.totalMinutes }),
    t(locale, "bot_workout_difficulty", { level: levelLabel(locale, plan.difficultyLevel) }),
    "",
    ...plan.exercises.map((e, i) => `${i + 1}. ${e.name} - ${e.sets} x ${e.reps}`),
    "",
    plan.notes ? t(locale, "bot_workout_note", { note: plan.notes }) : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendTodayWorkout(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  const locale = await getUserLocale(telegramId);
  const plan = await getOrCreateTodayWorkout(telegramId);
  const text = formatWorkoutMessage(locale, plan);
  const keyboard = buildTodayKeyboard(locale);

  try {
    await ctx.reply(text, keyboard);
  } catch (replyErr) {
    console.error("/today reply with keyboard failed:", replyErr);
    await ctx.reply(`${text}\n\n${t(locale, "bot_workout_webapp_tip")}`);
  }
}

bot.command("today", async (ctx) => {
  const locale = await getUserLocale(ctx.from?.id ?? 0);
  try {
    await sendTodayWorkout(ctx);
  } catch (err) {
    console.error("/today failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    await ctx.reply(t(locale, "bot_workout_load_error", { message }));
  }
});

bot.command("progress", async (ctx) => {
  const locale = await getUserLocale(ctx.from?.id ?? 0);
  await ctx.reply(t(locale, "bot_progress"));
});

bot.command("settings", async (ctx) => {
  const locale = await getUserLocale(ctx.from?.id ?? 0);
  await ctx.reply(t(locale, "bot_settings"), buildLanguageKeyboard(locale));
});

bot.action("today_regenerate", async (ctx) => {
  const locale = await getUserLocale(ctx.from?.id ?? 0);
  await ctx.answerCbQuery(t(locale, "bot_regenerating"));
  try {
    const telegramId = ctx.from?.id;
    if (telegramId) {
      const today = new Date().toISOString().slice(0, 10);
      await deleteWorkoutByDate(telegramId, today);
    }
    await sendTodayWorkout(ctx);
  } catch (err) {
    console.error("today_regenerate failed:", err);
    await ctx.reply(t(locale, "bot_regenerate_error"));
  }
});

bot.on("successful_payment", async (ctx) => {
  const locale = await getUserLocale(ctx.from?.id ?? 0);
  if (ctx.from?.id) {
    await upgradePremium(ctx.from.id, 30);
    await ctx.reply(t(locale, "bot_premium"));
  }
});

function buildWebhookUrl(): string {
  const base = env.APP_BASE_URL.replace(/\/+$/, "");
  return `${base}/telegram/webhook/${env.TELEGRAM_WEBHOOK_SECRET}`;
}

export function webhookPath(): string {
  return `/telegram/webhook/${env.TELEGRAM_WEBHOOK_SECRET}`;
}

export async function setupWebhook(): Promise<void> {
  const webhookUrl = buildWebhookUrl();

  if (!webhookUrl.startsWith("https://")) {
    console.warn(`Skip webhook setup: need https URL, got ${webhookUrl}`);
    return;
  }

  try {
    const info = await bot.telegram.getWebhookInfo();
    if (info.url === webhookUrl) {
      return;
    }
    await bot.telegram.setWebhook(webhookUrl);
    console.log(`Telegram webhook set: ${webhookUrl}`);
  } catch (err) {
    console.error("Webhook setup failed (non-fatal):", err);
  }
}

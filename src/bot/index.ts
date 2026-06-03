import { Context, Telegraf } from "telegraf";
import { env } from "../config/env.js";
import { startCommand } from "./commands/start.js";
import { buildTodayKeyboard } from "./keyboards/main.js";
import { deleteWorkoutByDate } from "../database/workouts-repo.js";
import { ensureDefaultUser, getOrCreateTodayWorkout } from "../services/workout-service.js";
import { getUser, upgradePremium, upsertUser } from "../database/users-repo.js";
import type { FitnessLevel } from "../types/workout.js";

export const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  void ctx.reply("Something went wrong. Try /start again in a moment.");
});

bot.start(startCommand);

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
      });
      await ctx.reply(`Level saved: ${level}. Send /today to get your workout.`);
    } catch (err) {
      console.error(`Level action ${action} failed:`, err);
      await ctx.reply("Could not save level. Check database on Vercel and try /start again.");
    }
  });
}

function formatWorkoutMessage(plan: Awaited<ReturnType<typeof getOrCreateTodayWorkout>>): string {
  return [
    `Today's focus: ${plan.targetMuscles.join(", ")}`,
    `Duration: ${plan.totalMinutes} min`,
    `Difficulty: ${plan.difficultyLevel}`,
    "",
    ...plan.exercises.map((e, i) => `${i + 1}. ${e.name} - ${e.sets} x ${e.reps}`),
    "",
    plan.notes ? `Note: ${plan.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendTodayWorkout(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  const plan = await getOrCreateTodayWorkout(telegramId);
  const text = formatWorkoutMessage(plan);
  const keyboard = buildTodayKeyboard();

  try {
    await ctx.reply(text, keyboard);
  } catch (replyErr) {
    console.error("/today reply with keyboard failed:", replyErr);
    await ctx.reply(
      `${text}\n\nTip: set WEBAPP_URL on Vercel to your HTTPS mini app URL to enable the Start Workout button.`,
    );
  }
}

bot.command("today", async (ctx) => {
  try {
    await sendTodayWorkout(ctx);
  } catch (err) {
    console.error("/today failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    await ctx.reply(
      `Could not load workout (${message}). Check OPENAI_API_KEY and DATABASE_URL on Vercel.`,
    );
  }
});

bot.command("progress", async (ctx) => {
  await ctx.reply("Progress tracking is in MVP mode. Complete workouts in Mini App to log sets.");
});

bot.command("settings", async (ctx) => {
  await ctx.reply("Settings flow: choose level with /start. More options in next iteration.");
});

bot.action("today_regenerate", async (ctx) => {
  await ctx.answerCbQuery("Generating...");
  try {
    const telegramId = ctx.from?.id;
    if (telegramId) {
      const today = new Date().toISOString().slice(0, 10);
      await deleteWorkoutByDate(telegramId, today);
    }
    await sendTodayWorkout(ctx);
  } catch (err) {
    console.error("today_regenerate failed:", err);
    await ctx.reply("Could not regenerate workout. Try /today again.");
  }
});

bot.on("successful_payment", async (ctx) => {
  if (ctx.from?.id) {
    await upgradePremium(ctx.from.id, 30);
    await ctx.reply("Premium activated for 30 days. Enjoy unlimited AI workouts.");
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

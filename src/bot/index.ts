import { Telegraf } from "telegraf";
import { env } from "../config/env.js";
import { startCommand } from "./commands/start.js";
import { todayKeyboard } from "./keyboards/main.js";
import { getOrCreateTodayWorkout } from "../services/workout-service.js";
import { upgradePremium } from "../database/users-repo.js";

export const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  void ctx.reply("Something went wrong. Try /start again in a moment.");
});

bot.start(startCommand);

bot.command("today", async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  try {
    const plan = await getOrCreateTodayWorkout(telegramId);
    await ctx.reply(
      [
        `Today's focus: ${plan.targetMuscles.join(", ")}`,
        `Duration: ${plan.totalMinutes} min`,
        `Difficulty: ${plan.difficultyLevel}`,
        "",
        ...plan.exercises.map((e, i) => `${i + 1}. ${e.name} - ${e.sets} x ${e.reps}`),
        "",
        plan.notes ? `Note: ${plan.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      todayKeyboard,
    );
  } catch (err) {
    console.error("/today failed:", err);
    await ctx.reply("Could not load workout. Check database connection and try again.");
  }
});

bot.command("progress", async (ctx) => {
  await ctx.reply("Progress tracking is in MVP mode. Complete workouts in Mini App to log sets.");
});

bot.command("settings", async (ctx) => {
  await ctx.reply("Settings flow: choose level with /start. More options in next iteration.");
});

bot.action("today", async (ctx) => {
  await ctx.answerCbQuery();
  if (ctx.from?.id) {
    await ctx.telegram.sendMessage(ctx.from.id, "Use /today to fetch your workout.");
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

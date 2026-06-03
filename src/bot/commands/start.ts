import { Context } from "telegraf";
import { startKeyboard } from "../keyboards/main.js";
import { ensureDefaultUser } from "../../services/workout-service.js";

export async function startCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  try {
    await ensureDefaultUser(telegramId);
    await ctx.reply(
      "Welcome to FitBot MVP. Choose your fitness level to personalize workouts.",
      startKeyboard,
    );
  } catch (err) {
    console.error("/start failed:", err);
    await ctx.reply("Bot is online, but database is not ready yet. Try again in 1 minute.");
  }
}

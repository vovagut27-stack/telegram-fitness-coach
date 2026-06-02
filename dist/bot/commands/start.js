import { startKeyboard } from "../keyboards/main.js";
import { ensureDefaultUser } from "../../services/workout-service.js";
export async function startCommand(ctx) {
    const telegramId = ctx.from?.id;
    if (!telegramId) {
        return;
    }
    await ensureDefaultUser(telegramId);
    await ctx.reply("Welcome to FitBot MVP. Choose your fitness level to personalize workouts.", startKeyboard);
}

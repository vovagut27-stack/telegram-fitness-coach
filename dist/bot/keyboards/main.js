import { Markup } from "telegraf";
import { env } from "../../config/env.js";
export const startKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("Beginner", "set_level_beginner")],
    [Markup.button.callback("Intermediate", "set_level_intermediate")],
    [Markup.button.callback("Advanced", "set_level_advanced")],
]);
export const todayKeyboard = Markup.inlineKeyboard([
    [Markup.button.webApp("Start Workout", env.WEBAPP_URL)],
    [Markup.button.callback("Regenerate", "today")],
]);

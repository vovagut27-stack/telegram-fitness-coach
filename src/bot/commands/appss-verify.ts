import type { Context } from "telegraf";
import { env } from "../../config/env.js";

/**
 * Подтверждение владения ботом для каталога Appss (@appss).
 * Ответ — только код из панели (APPSS_VERIFY_CODE или аргумент команды).
 */
export async function appssVerifyCommand(ctx: Context): Promise<void> {
  const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
  const fromMessage = text.replace(/^\/appss_verify(?:@\w+)?\s*/i, "").trim();
  const code = env.APPSS_VERIFY_CODE.trim() || fromMessage;

  if (!code) {
    return;
  }

  try {
    await ctx.reply(code);
  } catch (err) {
    console.error("/appss_verify failed:", err);
  }
}

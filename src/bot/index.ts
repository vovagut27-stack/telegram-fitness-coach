import { Telegraf } from "telegraf";
import { env } from "../config/env.js";
import { startCommand, getUserLocale } from "./commands/start.js";
import { buildMainKeyboard, buildPlanKeyboard, buildQuickPlanText } from "./keyboards/main.js";
import {
  getUser,
  parseAdminIds,
  revokePremium,
  upgradePremium,
} from "../database/users-repo.js";
import { isPremiumPayload, parsePremiumPayload, sendPremiumInvoice } from "./payments.js";
import { t } from "../i18n/index.js";
import { ensureDefaultUser, getWorkoutSchedule } from "../services/workout-service.js";
import { isPremiumActive } from "../services/premium-service.js";

export const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

void bot.telegram.getMe().then((me) => {
  bot.botInfo = me;
});

const adminIds = parseAdminIds(env.ADMIN_TELEGRAM_IDS);

function isAdmin(telegramId: number | undefined): boolean {
  return Boolean(telegramId && adminIds.includes(telegramId));
}

bot.catch(async (err, ctx) => {
  console.error("Bot error:", err);
  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery().catch(() => undefined);
    }
    const locale = await getUserLocale(ctx.from?.id ?? 0);
    await ctx.reply(t(locale, "bot_error_generic"));
  } catch (replyErr) {
    console.error("Bot catch reply failed:", replyErr);
  }
});

bot.start(startCommand);

bot.command("app", startCommand);

bot.command("plan", async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  try {
    await ensureDefaultUser(telegramId);
    const locale = await getUserLocale(telegramId);
    const schedule = await getWorkoutSchedule(telegramId, 7);
    await ctx.reply(buildQuickPlanText(locale, schedule), buildPlanKeyboard(locale, schedule));
  } catch (err) {
    console.error("/plan failed:", err);
    await ctx.reply(t(await getUserLocale(telegramId), "bot_error_generic"));
  }
});

bot.action("show_plan", async (ctx) => {
  await ctx.answerCbQuery();
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  try {
    await ensureDefaultUser(telegramId);
    const locale = await getUserLocale(telegramId);
    const schedule = await getWorkoutSchedule(telegramId, 7);
    await ctx.reply(buildQuickPlanText(locale, schedule), buildPlanKeyboard(locale, schedule));
  } catch (err) {
    console.error("show_plan failed:", err);
  }
});

bot.command("premium", async (ctx) => {
  try {
    await sendPremiumInvoice(ctx);
  } catch (err) {
    console.error("/premium failed:", err);
    const locale = await getUserLocale(ctx.from?.id ?? 0);
    await ctx.reply(t(locale, "bot_premium_error"));
  }
});

bot.command("devpremium", async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId || !isAdmin(telegramId)) {
    await ctx.reply(t(await getUserLocale(telegramId ?? 0), "bot_dev_denied"));
    return;
  }
  try {
    await ensureDefaultUser(telegramId);
    const user = await getUser(telegramId);
    const locale = user?.language ?? "ru";
    if (user && isPremiumActive(user)) {
      await revokePremium(telegramId);
      await ctx.reply(t(locale, "bot_premium_off"), buildMainKeyboard(locale));
      return;
    }
    await upgradePremium(telegramId, 365);
    const until = new Date();
    until.setDate(until.getDate() + 365);
    await ctx.reply(
      t(locale, "bot_premium_on", { date: until.toLocaleDateString() }),
      buildMainKeyboard(locale),
    );
  } catch (err) {
    console.error("/devpremium failed:", err);
    await ctx.reply(t(await getUserLocale(telegramId), "bot_error_generic"));
  }
});

bot.action("buy_premium", async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await sendPremiumInvoice(ctx);
  } catch (err) {
    console.error("buy_premium failed:", err);
    const locale = await getUserLocale(ctx.from?.id ?? 0);
    await ctx.reply(t(locale, "bot_premium_error"));
  }
});

bot.on("pre_checkout_query", async (ctx) => {
  const payload = ctx.preCheckoutQuery.invoice_payload;
  if (!isPremiumPayload(payload)) {
    await ctx.answerPreCheckoutQuery(false, "Invalid product");
    return;
  }
  await ctx.answerPreCheckoutQuery(true);
});

bot.on("successful_payment", async (ctx) => {
  const locale = await getUserLocale(ctx.from?.id ?? 0);
  const payment = ctx.message.successful_payment;
  if (!payment || !isPremiumPayload(payment.invoice_payload)) {
    return;
  }
  const parsed = parsePremiumPayload(payment.invoice_payload);
  const telegramId = ctx.from?.id;
  if (!parsed || !telegramId || parsed.telegramId !== telegramId) {
    return;
  }
  await upgradePremium(telegramId, parsed.days || env.PREMIUM_DAYS);
  await ctx.reply(t(locale, "bot_premium_ok"), buildMainKeyboard(locale));
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

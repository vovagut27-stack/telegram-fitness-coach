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
import { sendWeekPlan } from "./plan.js";
import {
  RESET_DATA_CANCEL,
  RESET_DATA_CONFIRM,
  resetDataCancelAction,
  resetDataCommand,
  resetDataConfirmAction,
} from "./commands/resetdata.js";
import { todayCommand } from "./commands/today.js";
import { statsCommand } from "./commands/stats.js";
import { settingsCommand } from "./commands/settings.js";
import {
  ensureLanguageChosen,
  LANG_PICK_EN,
  LANG_PICK_RU,
  SHOW_LANGUAGE,
  languageCommand,
  languagePickAction,
} from "./commands/language.js";
import { setupReportHandlers } from "./commands/report.js";
import { appssVerifyCommand } from "./commands/appss-verify.js";
import { supportCommand } from "./commands/support.js";
import { setupBotCommands, setupTelegramMenuButton } from "./telegram-mini-app-setup.js";
import { ensureDefaultUser } from "../services/workout-service.js";
import { isPremiumActive } from "../services/premium-service.js";

export const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

void bot.telegram.getMe().then((me) => {
  bot.botInfo = me;
});

const adminIds = parseAdminIds(env.ADMIN_TELEGRAM_IDS);

function isAdmin(telegramId: number | undefined): boolean {
  return Boolean(telegramId && adminIds.includes(telegramId));
}

function canUseDevPremium(telegramId: number | undefined, secretArg?: string): boolean {
  if (isAdmin(telegramId)) {
    return true;
  }
  const secret = env.DEV_PREMIUM_SECRET.trim();
  return Boolean(secret.length >= 4 && secretArg && secretArg === secret);
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

/** Каталог Appss — проверка, что бот ваш (ответ с кодом из панели публикации). */
bot.command("appss_verify", appssVerifyCommand);

bot.command("app", startCommand);

bot.command("today", todayCommand);

bot.command("stats", statsCommand);

bot.command("settings", settingsCommand);

bot.command(["support", "donate"], supportCommand);

bot.command(["language", "lang"], languageCommand);

bot.action(SHOW_LANGUAGE, async (ctx) => {
  await ctx.answerCbQuery().catch(() => undefined);
  await languageCommand(ctx);
});

bot.action(LANG_PICK_RU, async (ctx) => {
  await languagePickAction(ctx, "ru");
});

bot.action(LANG_PICK_EN, async (ctx) => {
  await languagePickAction(ctx, "en");
});

bot.command("plan", async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  if (!(await ensureLanguageChosen(ctx))) {
    return;
  }
  const locale = await getUserLocale(telegramId);
  const loading = await ctx.reply(t(locale, "bot_plan_loading"));
  await sendWeekPlan(ctx, telegramId, loading.message_id);
});

bot.action("show_plan", async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  if (!(await ensureLanguageChosen(ctx))) {
    return;
  }
  const locale = await getUserLocale(telegramId);
  await ctx.answerCbQuery(t(locale, "bot_plan_loading_short")).catch(() => undefined);
  let loadingMessageId: number | undefined;
  try {
    const loading = await ctx.reply(t(locale, "bot_plan_loading"));
    loadingMessageId = loading.message_id;
  } catch (err) {
    console.warn("plan loading message failed:", err);
  }
  await sendWeekPlan(ctx, telegramId, loadingMessageId);
});

bot.action(/^noop_/, async (ctx) => {
  const locale = await getUserLocale(ctx.from?.id ?? 0);
  await ctx
    .answerCbQuery(t(locale, "bot_plan_footer_no_app"), { show_alert: true })
    .catch(() => undefined);
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

bot.command("resetdata", resetDataCommand);

setupReportHandlers(bot);

bot.action(RESET_DATA_CONFIRM, resetDataConfirmAction);
bot.action(RESET_DATA_CANCEL, resetDataCancelAction);

bot.command("myid", async (ctx) => {
  const telegramId = ctx.from?.id;
  const locale = await getUserLocale(telegramId ?? 0);
  if (!telegramId) {
    return;
  }
  await ctx.reply(t(locale, "bot_my_id", { id: String(telegramId) }));
});

bot.command("devpremium", async (ctx) => {
  const telegramId = ctx.from?.id;
  const locale = await getUserLocale(telegramId ?? 0);
  const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
  const secretArg = text.split(/\s+/).slice(1).join(" ").trim();

  if (!telegramId || !canUseDevPremium(telegramId, secretArg || undefined)) {
    await ctx.reply(
      t(locale, "bot_dev_denied", { id: String(telegramId ?? "—") }),
    );
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
  await ensureDefaultUser(telegramId);
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
    if (info.url !== webhookUrl) {
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`Telegram webhook set: ${webhookUrl}`);
    }
    await setupTelegramMenuButton(bot);
    await setupBotCommands(bot);
  } catch (err) {
    console.error("Webhook setup failed (non-fatal):", err);
  }
}

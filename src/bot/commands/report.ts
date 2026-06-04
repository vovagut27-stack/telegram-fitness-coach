import type { Context, Telegraf } from "telegraf";
import { getUser } from "../../database/users-repo.js";
import { t } from "../../i18n/index.js";
import {
  formatOwnerReportMessage,
  getReportRecipientIds,
  sendUserReportToOwners,
  trimReportText,
  type UserReportPayload,
} from "../../services/report-service.js";
import { getUserLocale } from "./start.js";

const pendingByUser = new Map<number, true>();

const PENDING_TTL_MS = 15 * 60 * 1000;
const pendingExpiry = new Map<number, ReturnType<typeof setTimeout>>();

function setPending(telegramId: number): void {
  clearPending(telegramId);
  pendingByUser.set(telegramId, true);
  const timer = setTimeout(() => {
    pendingByUser.delete(telegramId);
    pendingExpiry.delete(telegramId);
  }, PENDING_TTL_MS);
  pendingExpiry.set(telegramId, timer);
}

export function clearPending(telegramId: number): boolean {
  const had = pendingByUser.delete(telegramId);
  const timer = pendingExpiry.get(telegramId);
  if (timer) {
    clearTimeout(timer);
    pendingExpiry.delete(telegramId);
  }
  return had;
}

function isPending(telegramId: number): boolean {
  return pendingByUser.has(telegramId);
}

function commandPayload(ctx: Context): string {
  const msg = ctx.message;
  if (!msg || !("text" in msg)) {
    return "";
  }
  const text = msg.text.trim();
  const match = text.match(/^\/report(?:@\w+)?\s*([\s\S]*)$/i);
  return (match?.[1] ?? "").trim();
}

function reporterName(ctx: Context): string {
  const from = ctx.from;
  if (!from) {
    return "Unknown";
  }
  const parts = [from.first_name, from.last_name].filter(Boolean);
  return parts.join(" ") || from.username || String(from.id);
}

async function submitReport(ctx: Context, rawText: string): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }

  const locale = await getUserLocale(telegramId);
  const text = trimReportText(rawText);

  if (!text) {
    await ctx.reply(t(locale, "report_empty"));
    return;
  }

  const user = await getUser(telegramId);
  const payload: UserReportPayload = {
    reporterId: telegramId,
    reporterUsername: ctx.from?.username,
    reporterName: reporterName(ctx),
    text,
    locale: user?.language ?? locale,
  };

  const result = await sendUserReportToOwners(ctx.telegram, payload);

  if (result.sent) {
    await ctx.reply(t(locale, "report_sent"));
    return;
  }

  if (result.reason === "no_recipients") {
    await ctx.reply(t(locale, "report_not_configured"));
    return;
  }

  await ctx.reply(t(locale, "report_send_failed"));
}

export async function reportCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }

  const locale = await getUserLocale(telegramId);
  const inline = commandPayload(ctx);

  if (inline) {
    clearPending(telegramId);
    await submitReport(ctx, inline);
    return;
  }

  setPending(telegramId);
  await ctx.reply(t(locale, "report_prompt"), { parse_mode: "HTML" });
}

export async function reportCancelCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  const locale = await getUserLocale(telegramId);
  if (clearPending(telegramId)) {
    await ctx.reply(t(locale, "report_cancelled"));
  }
}

export function setupReportHandlers(bot: Telegraf): void {
  bot.command("report", reportCommand);
  bot.command("cancel", reportCancelCommand);

  bot.on("text", async (ctx, next) => {
    const telegramId = ctx.from?.id;
    if (!telegramId || !isPending(telegramId)) {
      return next();
    }

    const msg = ctx.message;
    if (!msg || !("text" in msg)) {
      return next();
    }

    if (msg.text.startsWith("/")) {
      return next();
    }

    clearPending(telegramId);
    await submitReport(ctx, msg.text);
  });

  bot.on("photo", async (ctx, next) => {
    const telegramId = ctx.from?.id;
    if (!telegramId || !isPending(telegramId)) {
      return next();
    }

    clearPending(telegramId);
    const locale = await getUserLocale(telegramId);
    const photos = ctx.message.photo;
    const largest = photos[photos.length - 1];
    const caption = trimReportText(
      ctx.message.caption ?? t(locale, "report_photo_no_caption"),
    );

    const user = await getUser(telegramId);
    const header = formatOwnerReportMessage({
      reporterId: telegramId,
      reporterUsername: ctx.from?.username,
      reporterName: reporterName(ctx),
      text: caption,
      locale: user?.language ?? locale,
    });

    const recipients = getReportRecipientIds();

    if (recipients.length === 0) {
      await ctx.reply(t(locale, "report_not_configured"));
      return;
    }

    let anySent = false;
    const photoCaption = header.length > 1024 ? `${header.slice(0, 1020)}…` : header;

    for (const chatId of recipients) {
      try {
        await ctx.telegram.sendPhoto(chatId, largest.file_id, {
          caption: photoCaption,
          parse_mode: "HTML",
        });
        anySent = true;
      } catch (err) {
        console.error(`Failed to send report photo to ${chatId}:`, err);
      }
    }

    await ctx.reply(anySent ? t(locale, "report_sent") : t(locale, "report_send_failed"));
  });
}

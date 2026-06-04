import type { Telegram } from "telegraf";
import { env } from "../config/env.js";
import { parseAdminIds } from "../database/users-repo.js";

const MAX_REPORT_LENGTH = 2000;

export function getReportRecipientIds(): number[] {
  const fromReport = parseAdminIds(env.REPORT_TELEGRAM_IDS);
  if (fromReport.length > 0) {
    return fromReport;
  }
  return parseAdminIds(env.ADMIN_TELEGRAM_IDS);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type UserReportPayload = {
  reporterId: number;
  reporterUsername?: string;
  reporterName: string;
  text: string;
  locale?: string;
};

export function trimReportText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_REPORT_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, MAX_REPORT_LENGTH)}…`;
}

export function formatOwnerReportMessage(payload: UserReportPayload): string {
  const username = payload.reporterUsername
    ? `@${escapeHtml(payload.reporterUsername)}`
    : "—";
  const when = new Date().toISOString().replace("T", " ").slice(0, 19);
  const locale = payload.locale ? escapeHtml(payload.locale) : "—";

  return [
    "🐛 <b>Репорт об ошибке</b>",
    "",
    `<b>Пользователь:</b> ${escapeHtml(payload.reporterName)}`,
    `<b>Username:</b> ${username}`,
    `<b>ID:</b> <code>${payload.reporterId}</code>`,
    `<b>Язык:</b> ${locale}`,
    `<b>Время (UTC):</b> ${when}`,
    "",
    "<b>Сообщение:</b>",
    escapeHtml(payload.text),
  ].join("\n");
}

export async function sendUserReportToOwners(
  telegram: Telegram,
  payload: UserReportPayload,
): Promise<{ sent: boolean; reason?: "no_recipients" | "send_failed" }> {
  const recipients = getReportRecipientIds();
  if (recipients.length === 0) {
    console.warn("Report skipped: set REPORT_TELEGRAM_IDS or ADMIN_TELEGRAM_IDS");
    return { sent: false, reason: "no_recipients" };
  }

  const html = formatOwnerReportMessage(payload);
  let anySent = false;

  for (const chatId of recipients) {
    try {
      await telegram.sendMessage(chatId, html, { parse_mode: "HTML" });
      anySent = true;
    } catch (err) {
      console.error(`Failed to send report to ${chatId}:`, err);
    }
  }

  return anySent ? { sent: true } : { sent: false, reason: "send_failed" };
}

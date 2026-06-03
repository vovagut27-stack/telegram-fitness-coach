import type { Context } from "telegraf";
import { env } from "../config/env.js";
import type { Locale } from "../types/locale.js";

export function premiumPayload(telegramId: number): string {
  return `premium_${env.PREMIUM_DAYS}_${telegramId}`;
}

export function isPremiumPayload(payload: string): boolean {
  return payload.startsWith("premium_");
}

export function parsePremiumPayload(payload: string): { days: number; telegramId: number } | null {
  const parts = payload.split("_");
  if (parts.length < 3 || parts[0] !== "premium") {
    return null;
  }
  const days = Number(parts[1]);
  const telegramId = Number(parts[2]);
  if (!days || !telegramId) {
    return null;
  }
  return { days, telegramId };
}

export async function createPremiumInvoiceLink(
  telegramId: number,
  locale: Locale,
): Promise<string> {
  const { bot } = await import("./index.js");
  const isRu = locale === "ru";

  return bot.telegram.createInvoiceLink({
    title: isRu ? "FitBot Premium ⭐" : "FitBot Premium ⭐",
    description: isRu
      ? `${env.PREMIUM_DAYS} дней: безлимит AI, программа зала, персонализация`
      : `${env.PREMIUM_DAYS} days: unlimited AI, gym program, full personalization`,
    payload: premiumPayload(telegramId),
    provider_token: "",
    currency: "XTR",
    prices: [{ label: isRu ? "Premium" : "Premium", amount: env.PREMIUM_STARS_PRICE }],
  });
}

export async function sendPremiumInvoice(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  const { getUser } = await import("../database/users-repo.js");
  const user = await getUser(telegramId);
  const locale = user?.language ?? "ru";
  const isRu = locale === "ru";

  await ctx.replyWithInvoice({
    title: isRu ? "FitBot Premium ⭐" : "FitBot Premium ⭐",
    description: isRu
      ? `Полный доступ ${env.PREMIUM_DAYS} дней`
      : `Full access for ${env.PREMIUM_DAYS} days`,
    payload: premiumPayload(telegramId),
    provider_token: "",
    currency: "XTR",
    prices: [{ label: "Premium", amount: env.PREMIUM_STARS_PRICE }],
  });
}

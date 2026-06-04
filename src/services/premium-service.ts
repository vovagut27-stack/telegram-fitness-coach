import { getUser, type UserProfile } from "../database/users-repo.js";

export function isPremiumActive(user: UserProfile): boolean {
  if (!user.isPremium) {
    return false;
  }
  if (!user.premiumUntil) {
    return true;
  }
  return new Date(user.premiumUntil) > new Date();
}

export async function assertPremiumActive(telegramId: number): Promise<UserProfile> {
  const user = await getUser(telegramId);
  if (!user || !isPremiumActive(user)) {
    throw new Error("PREMIUM_REQUIRED");
  }
  return user;
}

export function maxResultsHistoryDays(isPremium: boolean): number {
  return isPremium ? 120 : 30;
}

export function maxScheduleDays(isPremium: boolean): number {
  return isPremium ? 14 : 7;
}

export type RestPreset = "short" | "normal" | "long";

export function restPresetMultiplier(preset: RestPreset): number {
  if (preset === "short") {
    return 0.85;
  }
  if (preset === "long") {
    return 1.2;
  }
  return 1;
}

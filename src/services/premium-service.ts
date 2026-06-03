import type { UserProfile } from "../database/users-repo.js";

export function isPremiumActive(user: UserProfile): boolean {
  if (!user.isPremium) {
    return false;
  }
  if (!user.premiumUntil) {
    return true;
  }
  return new Date(user.premiumUntil) > new Date();
}

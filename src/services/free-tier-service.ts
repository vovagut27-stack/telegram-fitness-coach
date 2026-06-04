import { countCompletedThisWeek } from "../database/workouts-repo.js";
import { getUser } from "../database/users-repo.js";
import { env } from "../config/env.js";
import { isPremiumActive } from "./premium-service.js";

export interface FreeTierStatus {
  isPremium: boolean;
  weeklyLimit: number;
  completedThisWeek: number;
  remaining: number;
  canStartNewWorkout: boolean;
}

export async function getFreeTierStatus(telegramId: number): Promise<FreeTierStatus> {
  const user = await getUser(telegramId);
  const isPremium = Boolean(user && isPremiumActive(user));
  const weeklyLimit = env.FREE_WORKOUTS_PER_WEEK;
  const completedThisWeek = await countCompletedThisWeek(telegramId);
  const remaining = isPremium ? weeklyLimit : Math.max(0, weeklyLimit - completedThisWeek);
  return {
    isPremium,
    weeklyLimit,
    completedThisWeek,
    remaining: isPremium ? weeklyLimit : remaining,
    canStartNewWorkout: isPremium || completedThisWeek < weeklyLimit,
  };
}

import { getCompletedWorkoutDates } from "../database/workouts-repo.js";
import { isoDateOnly } from "./schedule-service.js";

function shiftIsoDate(iso: string, deltaDays: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return isoDateOnly(dt);
}

/** Consecutive completed workout days ending today or yesterday. */
export function calcStreakFromDates(completedDates: string[]): number {
  if (completedDates.length === 0) {
    return 0;
  }
  const set = new Set(completedDates);
  const today = isoDateOnly();
  let cursor = set.has(today) ? today : shiftIsoDate(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftIsoDate(cursor, -1);
  }
  return streak;
}

export async function getWorkoutStreak(telegramId: number): Promise<number> {
  const dates = await getCompletedWorkoutDates(telegramId, 120);
  return calcStreakFromDates(dates);
}

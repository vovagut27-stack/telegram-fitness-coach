import { db } from "./index.js";
import { ensureUserRow, getUser } from "./users-repo.js";
import { isPremiumActive } from "../services/premium-service.js";
import { DEFAULT_LOCALE } from "../types/locale.js";

export interface ResetUserDataResult {
  workoutsDeleted: number;
  weightLogsDeleted: number;
  premiumKept: boolean;
  language: string;
}

/**
 * Удаляет профиль, тренировки, логи и вес — Premium и язык сохраняются.
 */
export async function resetUserPersonalData(telegramId: number): Promise<ResetUserDataResult> {
  await ensureUserRow(telegramId);
  const existing = await getUser(telegramId);
  const language = existing?.language ?? DEFAULT_LOCALE;

  await db.query(
    `
      DELETE FROM exercise_logs
      WHERE workout_id IN (
        SELECT id FROM workouts WHERE telegram_id = $1::bigint
      )
    `,
    [String(telegramId)],
  );

  const workoutsDel = await db.query(
    `DELETE FROM workouts WHERE telegram_id = $1::bigint`,
    [String(telegramId)],
  );

  const weightDel = await db.query(
    `DELETE FROM weight_logs WHERE telegram_id = $1::bigint`,
    [String(telegramId)],
  );

  await db.query(
    `
      UPDATE users SET
        fitness_level = 'beginner',
        available_equipment = ARRAY['bodyweight', 'home']::text[],
        goals = ARRAY['strength']::text[],
        time_per_session = 45,
        gender = NULL,
        age = NULL,
        weight_kg = NULL,
        height_cm = NULL,
        training_mode = 'home',
        profile_complete = FALSE,
        language = $2
      WHERE telegram_id = $1::bigint
    `,
    [String(telegramId), language],
  );

  return {
    workoutsDeleted: workoutsDel.rowCount ?? 0,
    weightLogsDeleted: weightDel.rowCount ?? 0,
    premiumKept: existing ? isPremiumActive(existing) : false,
    language,
  };
}

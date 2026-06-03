import { db } from "./index.js";
import { DEFAULT_LOCALE, parseLocale, type Locale } from "../types/locale.js";
import { FitnessLevel } from "../types/workout.js";

export interface UserProfile {
  telegramId: number;
  fitnessLevel: FitnessLevel;
  availableEquipment: string[];
  goals: string[];
  timePerSession: number;
  isPremium: boolean;
  language: Locale;
}

export async function upsertUser(user: UserProfile): Promise<void> {
  await db.query(
    `
    INSERT INTO users (telegram_id, fitness_level, available_equipment, goals, time_per_session, is_premium, language)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (telegram_id)
    DO UPDATE SET
      fitness_level = EXCLUDED.fitness_level,
      available_equipment = EXCLUDED.available_equipment,
      goals = EXCLUDED.goals,
      time_per_session = EXCLUDED.time_per_session,
      language = EXCLUDED.language
  `,
    [
      user.telegramId,
      user.fitnessLevel,
      user.availableEquipment,
      user.goals,
      user.timePerSession,
      user.isPremium,
      user.language,
    ],
  );
}

export async function setUserFitnessLevel(
  telegramId: number,
  level: FitnessLevel,
): Promise<UserProfile> {
  const updated = await db.query(
    `
      UPDATE users SET fitness_level = $2 WHERE telegram_id = $1
      RETURNING telegram_id, fitness_level, available_equipment, goals, time_per_session, is_premium, language
    `,
    [telegramId, level],
  );
  if (updated.rows[0]) {
    const row = updated.rows[0];
    return {
      telegramId: Number(row.telegram_id),
      fitnessLevel: row.fitness_level,
      availableEquipment: row.available_equipment,
      goals: row.goals,
      timePerSession: row.time_per_session,
      isPremium: row.is_premium,
      language: parseLocale(row.language),
    };
  }
  await upsertUser({
    telegramId,
    fitnessLevel: level,
    availableEquipment: ["bodyweight"],
    goals: ["strength"],
    timePerSession: 25,
    isPremium: false,
    language: DEFAULT_LOCALE,
  });
  const user = await getUser(telegramId);
  if (!user) {
    throw new Error("Failed to save fitness level");
  }
  return user;
}

export async function setUserLanguage(telegramId: number, language: Locale): Promise<void> {
  const updated = await db.query(
    `UPDATE users SET language = $2 WHERE telegram_id = $1`,
    [telegramId, language],
  );
  if ((updated.rowCount ?? 0) > 0) {
    return;
  }
  await upsertUser({
    telegramId,
    fitnessLevel: "beginner",
    availableEquipment: ["bodyweight"],
    goals: ["strength"],
    timePerSession: 25,
    isPremium: false,
    language,
  });
}

export async function getUser(telegramId: number): Promise<UserProfile | null> {
  const result = await db.query(
    `
      SELECT telegram_id, fitness_level, available_equipment, goals, time_per_session, is_premium, language
      FROM users
      WHERE telegram_id = $1
    `,
    [telegramId],
  );
  if (!result.rows[0]) {
    return null;
  }
  const row = result.rows[0];
  return {
    telegramId: Number(row.telegram_id),
    fitnessLevel: row.fitness_level,
    availableEquipment: row.available_equipment,
    goals: row.goals,
    timePerSession: row.time_per_session,
    isPremium: row.is_premium,
    language: parseLocale(row.language),
  };
}

export async function upgradePremium(telegramId: number, days: number): Promise<void> {
  await db.query(
    `
      UPDATE users
      SET is_premium = TRUE, premium_until = NOW() + ($2 || ' days')::interval
      WHERE telegram_id = $1
    `,
    [telegramId, days],
  );
}

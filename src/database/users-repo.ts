import { db } from "./index.js";
import { DEFAULT_LOCALE, parseLocale, type Locale } from "../types/locale.js";
import {
  isProfileComplete,
  parseGender,
  parseTrainingMode,
  type BodyProfile,
  type Gender,
  type TrainingMode,
} from "../types/profile.js";
import { FitnessLevel } from "../types/workout.js";

export interface UserProfile {
  telegramId: number;
  fitnessLevel: FitnessLevel;
  availableEquipment: string[];
  goals: string[];
  timePerSession: number;
  isPremium: boolean;
  premiumUntil: string | null;
  language: Locale;
  gender: Gender | null;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  trainingMode: TrainingMode;
  profileComplete: boolean;
}

const USER_COLUMNS = `
  telegram_id, fitness_level, available_equipment, goals, time_per_session,
  is_premium, premium_until, language, gender, age, weight_kg, height_cm,
  training_mode, profile_complete
`;

function mapRow(row: Record<string, unknown>): UserProfile {
  return {
    telegramId: Number(row.telegram_id),
    fitnessLevel: row.fitness_level as FitnessLevel,
    availableEquipment: row.available_equipment as string[],
    goals: row.goals as string[],
    timePerSession: Number(row.time_per_session),
    isPremium: Boolean(row.is_premium),
    premiumUntil: row.premium_until ? String(row.premium_until) : null,
    language: parseLocale(row.language),
    gender: parseGender(row.gender),
    age: row.age != null ? Number(row.age) : null,
    weightKg: row.weight_kg != null ? Number(row.weight_kg) : null,
    heightCm: row.height_cm != null ? Number(row.height_cm) : null,
    trainingMode: parseTrainingMode(row.training_mode),
    profileComplete: Boolean(row.profile_complete),
  };
}

export async function upsertUser(user: UserProfile): Promise<void> {
  await db.query(
    `
    INSERT INTO users (
      telegram_id, fitness_level, available_equipment, goals, time_per_session,
      is_premium, premium_until, language, gender, age, weight_kg, height_cm,
      training_mode, profile_complete
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    ON CONFLICT (telegram_id)
    DO UPDATE SET
      fitness_level = EXCLUDED.fitness_level,
      available_equipment = EXCLUDED.available_equipment,
      goals = EXCLUDED.goals,
      time_per_session = EXCLUDED.time_per_session,
      is_premium = EXCLUDED.is_premium,
      premium_until = EXCLUDED.premium_until,
      language = EXCLUDED.language,
      gender = EXCLUDED.gender,
      age = EXCLUDED.age,
      weight_kg = EXCLUDED.weight_kg,
      height_cm = EXCLUDED.height_cm,
      training_mode = EXCLUDED.training_mode,
      profile_complete = EXCLUDED.profile_complete
  `,
    [
      user.telegramId,
      user.fitnessLevel,
      user.availableEquipment,
      user.goals,
      user.timePerSession,
      user.isPremium,
      user.premiumUntil,
      user.language,
      user.gender,
      user.age,
      user.weightKg,
      user.heightCm,
      user.trainingMode,
      user.profileComplete,
    ],
  );
}

export async function getUser(telegramId: number): Promise<UserProfile | null> {
  const result = await db.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE telegram_id = $1`,
    [telegramId],
  );
  if (!result.rows[0]) {
    return null;
  }
  return mapRow(result.rows[0]);
}

export async function updateUserProfile(
  telegramId: number,
  patch: Partial<BodyProfile> & {
    fitnessLevel?: FitnessLevel;
    language?: Locale;
    goals?: string[];
    timePerSession?: number;
    availableEquipment?: string[];
  },
): Promise<UserProfile> {
  const current = await getUser(telegramId);
  const base: UserProfile = current ?? {
    telegramId,
    fitnessLevel: "beginner",
    availableEquipment: ["bodyweight"],
    goals: ["strength"],
    timePerSession: 45,
    isPremium: false,
    premiumUntil: null,
    language: DEFAULT_LOCALE,
    gender: null,
    age: null,
    weightKg: null,
    heightCm: null,
    trainingMode: "home",
    profileComplete: false,
  };

  const merged: UserProfile = {
    ...base,
    fitnessLevel: patch.fitnessLevel ?? base.fitnessLevel,
    language: patch.language ?? base.language,
    goals: patch.goals ?? base.goals,
    timePerSession: patch.timePerSession ?? base.timePerSession,
    availableEquipment: patch.availableEquipment ?? base.availableEquipment,
    gender: patch.gender !== undefined ? patch.gender : base.gender,
    age: patch.age !== undefined ? patch.age : base.age,
    weightKg: patch.weightKg !== undefined ? patch.weightKg : base.weightKg,
    heightCm: patch.heightCm !== undefined ? patch.heightCm : base.heightCm,
    trainingMode: patch.trainingMode ?? base.trainingMode,
  };

  merged.availableEquipment =
    merged.trainingMode === "gym"
      ? ["gym", "barbell", "dumbbell", "cable", "machine"]
      : ["bodyweight", "home"];

  merged.profileComplete = isProfileComplete({
    gender: merged.gender,
    age: merged.age,
    weightKg: merged.weightKg,
    heightCm: merged.heightCm,
    trainingMode: merged.trainingMode,
    profileComplete: false,
  });

  await upsertUser(merged);
  const saved = await getUser(telegramId);
  if (!saved) {
    throw new Error("Failed to save profile");
  }
  return saved;
}

export async function setUserFitnessLevel(
  telegramId: number,
  level: FitnessLevel,
): Promise<UserProfile> {
  return updateUserProfile(telegramId, { fitnessLevel: level });
}

export async function setUserLanguage(telegramId: number, language: Locale): Promise<void> {
  await updateUserProfile(telegramId, { language });
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

export async function revokePremium(telegramId: number): Promise<void> {
  await db.query(
    `
      UPDATE users
      SET is_premium = FALSE, premium_until = NULL
      WHERE telegram_id = $1
    `,
    [telegramId],
  );
}

export function parseAdminIds(raw: string): number[] {
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

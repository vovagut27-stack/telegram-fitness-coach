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
  remindersEnabled: boolean;
  reminderHour: number;
  timezoneOffsetMinutes: number;
  restPreset: "short" | "normal" | "long";
}

const USER_COLUMNS = `
  telegram_id, fitness_level, available_equipment, goals, time_per_session,
  is_premium, premium_until, language, gender, age, weight_kg, height_cm,
  training_mode, profile_complete, reminders_enabled, reminder_hour, timezone_offset_minutes,
  rest_preset
`;

function mapRow(row: Record<string, unknown>): UserProfile {
  return {
    telegramId: Number(row.telegram_id),
    fitnessLevel: (row.fitness_level as FitnessLevel) ?? "beginner",
    availableEquipment: (row.available_equipment as string[]) ?? ["bodyweight", "home"],
    goals: (row.goals as string[]) ?? ["strength"],
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
    remindersEnabled: Boolean(row.reminders_enabled ?? false),
    reminderHour: Number(row.reminder_hour ?? 9),
    timezoneOffsetMinutes: Number(row.timezone_offset_minutes ?? 180),
    restPreset: parseRestPreset(row.rest_preset),
  };
}

function parseRestPreset(raw: unknown): "short" | "normal" | "long" {
  const v = String(raw ?? "normal");
  if (v === "short" || v === "long") {
    return v;
  }
  return "normal";
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
    `SELECT ${USER_COLUMNS} FROM users WHERE telegram_id = $1::bigint`,
    [String(telegramId)],
  );
  if (!result.rows[0]) {
    return null;
  }
  return mapRow(result.rows[0]);
}

export async function ensureUserRow(telegramId: number): Promise<void> {
  await db.query(
    `
      INSERT INTO users (
        telegram_id, fitness_level, available_equipment, goals, time_per_session,
        language, training_mode, profile_complete, is_premium
      )
      VALUES (
        $1::bigint, 'beginner', ARRAY['bodyweight', 'home']::text[], ARRAY['strength']::text[],
        45, 'ru', 'home', FALSE, FALSE
      )
      ON CONFLICT (telegram_id) DO NOTHING
    `,
    [String(telegramId)],
  );
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
    availableEquipment: ["bodyweight", "home"],
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
    remindersEnabled: false,
    reminderHour: 9,
    timezoneOffsetMinutes: 180,
    restPreset: "normal",
  };

  const bodyChanged =
    patch.gender !== undefined ||
    patch.age !== undefined ||
    patch.weightKg !== undefined ||
    patch.heightCm !== undefined ||
    patch.fitnessLevel !== undefined ||
    patch.timePerSession !== undefined;

  const gender = patch.gender !== undefined ? patch.gender : base.gender;
  const age = patch.age !== undefined ? patch.age : base.age;
  const weightKg = patch.weightKg !== undefined ? patch.weightKg : base.weightKg;
  const heightCm = patch.heightCm !== undefined ? patch.heightCm : base.heightCm;
  const fitnessLevel = patch.fitnessLevel ?? base.fitnessLevel ?? "beginner";
  const language = patch.language ?? base.language ?? DEFAULT_LOCALE;
  const goals = patch.goals ?? base.goals ?? ["strength"];
  const timePerSession = patch.timePerSession ?? base.timePerSession ?? 45;

  const profileComplete = isProfileComplete({
    gender,
    age,
    weightKg,
    heightCm,
    trainingMode: "home",
    profileComplete: false,
  });

  const result = await db.query(
    `
      INSERT INTO users (
        telegram_id, fitness_level, available_equipment, goals, time_per_session,
        language, gender, age, weight_kg, height_cm, training_mode, profile_complete,
        is_premium, premium_until
      )
      VALUES (
        $1::bigint, $6, ARRAY['bodyweight', 'home']::text[], $7, $8, $5,
        $2, $3, $4, $9, 'home', $10, FALSE, NULL
      )
      ON CONFLICT (telegram_id) DO UPDATE SET
        gender = EXCLUDED.gender,
        age = EXCLUDED.age,
        weight_kg = EXCLUDED.weight_kg,
        height_cm = EXCLUDED.height_cm,
        fitness_level = EXCLUDED.fitness_level,
        language = EXCLUDED.language,
        goals = EXCLUDED.goals,
        time_per_session = EXCLUDED.time_per_session,
        training_mode = 'home',
        available_equipment = ARRAY['bodyweight', 'home']::text[],
        profile_complete = EXCLUDED.profile_complete
      RETURNING ${USER_COLUMNS}
    `,
    [
      String(telegramId),
      gender,
      age,
      weightKg,
      language,
      fitnessLevel,
      goals,
      timePerSession,
      heightCm,
      profileComplete,
    ],
  );

  if (!result.rows[0]) {
    throw new Error("Profile save failed");
  }

  const prevWeight = base.weightKg;
  if (
    patch.weightKg !== undefined &&
    patch.weightKg != null &&
    (prevWeight == null || Math.abs(patch.weightKg - prevWeight) > 0.05)
  ) {
    const { addWeightLog } = await import("./weight-repo.js");
    const { isoDateOnly } = await import("../services/schedule-service.js");
    await addWeightLog(telegramId, patch.weightKg, isoDateOnly());
  }

  if (bodyChanged) {
    try {
      const { deleteIncompleteWorkoutsFrom } = await import("./workouts-repo.js");
      const { isoDateOnly } = await import("../services/schedule-service.js");
      await deleteIncompleteWorkoutsFrom(telegramId, isoDateOnly());
    } catch (err) {
      console.warn("clear workouts after profile save:", err);
    }
  }

  return mapRow(result.rows[0]);
}

export async function setUserWeightKg(telegramId: number, weightKg: number): Promise<void> {
  await db.query(
    `UPDATE users SET weight_kg = $2 WHERE telegram_id = $1::bigint`,
    [String(telegramId), weightKg],
  );
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

export async function updateUserSettings(
  telegramId: number,
  patch: {
    remindersEnabled?: boolean;
    reminderHour?: number;
    timezoneOffsetMinutes?: number;
    restPreset?: "short" | "normal" | "long";
  },
): Promise<UserProfile> {
  await ensureUserRow(telegramId);
  const hour =
    patch.reminderHour != null
      ? Math.min(23, Math.max(0, Math.round(patch.reminderHour)))
      : null;
  const offset =
    patch.timezoneOffsetMinutes != null
      ? Math.min(840, Math.max(-720, Math.round(patch.timezoneOffsetMinutes)))
      : null;
  const restPreset =
    patch.restPreset === "short" || patch.restPreset === "long" || patch.restPreset === "normal"
      ? patch.restPreset
      : null;

  await db.query(
    `
      UPDATE users
      SET
        reminders_enabled = COALESCE($2, reminders_enabled),
        reminder_hour = COALESCE($3, reminder_hour),
        timezone_offset_minutes = COALESCE($4, timezone_offset_minutes),
        rest_preset = COALESCE($5, rest_preset)
      WHERE telegram_id = $1::bigint
    `,
    [String(telegramId), patch.remindersEnabled ?? null, hour, offset, restPreset],
  );

  const user = await getUser(telegramId);
  if (!user) {
    throw new Error("User not found after settings update");
  }
  return user;
}

export async function listUsersWithReminders(): Promise<UserProfile[]> {
  const result = await db.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE reminders_enabled = TRUE`,
  );
  return result.rows.map((row) => mapRow(row));
}

export async function upgradePremium(telegramId: number, days: number): Promise<void> {
  const updated = await db.query(
    `
      UPDATE users
      SET is_premium = TRUE, premium_until = NOW() + ($2 || ' days')::interval
      WHERE telegram_id = $1
    `,
    [telegramId, days],
  );
  if ((updated.rowCount ?? 0) === 0) {
    await upsertUser({
      telegramId,
      fitnessLevel: "beginner",
      availableEquipment: ["bodyweight", "home"],
      goals: ["strength"],
      timePerSession: 45,
      isPremium: true,
      premiumUntil: null,
      language: DEFAULT_LOCALE,
      gender: null,
      age: null,
      weightKg: null,
      heightCm: null,
      trainingMode: "home",
      profileComplete: false,
      remindersEnabled: false,
      reminderHour: 9,
      timezoneOffsetMinutes: 180,
      restPreset: "normal",
    });
    await db.query(
      `
        UPDATE users
        SET is_premium = TRUE, premium_until = NOW() + ($2 || ' days')::interval
        WHERE telegram_id = $1
      `,
      [telegramId, days],
    );
  }
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

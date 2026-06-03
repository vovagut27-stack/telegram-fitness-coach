import { env } from "../config/env.js";
import { DEFAULT_LOCALE } from "../types/locale.js";
import { calcBmi } from "../types/profile.js";
import { getUser, upsertUser, type UserProfile } from "../database/users-repo.js";
import {
  countCompletedThisWeek,
  deleteWorkoutByDate,
  getRecentWorkouts,
  getWorkoutByDate,
  saveWorkoutPlan,
} from "../database/workouts-repo.js";
import { FitnessLevel, WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { buildTemplateWorkout } from "./workout-templates.js";
import { isPremiumActive } from "./premium-service.js";
import { enrichWorkoutExercises } from "./exercise-images.js";
import {
  attachScheduleMeta,
  buildScheduleDays,
  getSplitForDate,
  isoDateOnly,
  type ScheduleDayItem,
} from "./schedule-service.js";

export async function ensureDefaultUser(telegramId: number): Promise<void> {
  const existing = await getUser(telegramId);
  if (existing) {
    return;
  }
  await upsertUser({
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
  });
}

function buildRequest(
  user: UserProfile,
  recent: WorkoutPlan[],
  _weeklyCount: number,
  targetMuscles: string[],
): WorkoutRequest {
  const difficulty = user.fitnessLevel;
  const bmi =
    user.weightKg && user.heightCm ? calcBmi(user.weightKg, user.heightCm) : null;

  return {
    userId: String(user.telegramId),
    fitnessLevel: difficulty,
    availableEquipment: user.availableEquipment,
    timeMinutes: user.timePerSession,
    lastWorkouts: recent,
    targetMuscles,
    language: user.language,
    gender: user.gender,
    age: user.age,
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    bmi,
    trainingMode: "home",
    goals: user.goals,
  };
}

async function generatePlan(
  user: UserProfile,
  recent: WorkoutPlan[],
  weeklyCount: number,
  targetMuscles: string[],
): Promise<WorkoutPlan> {
  const premium = isPremiumActive(user);
  const request = buildRequest(user, recent, weeklyCount, targetMuscles);
  const useAi =
    env.USE_AI_WORKOUTS || (premium && user.profileComplete) || user.profileComplete;

  if (!useAi) {
    return buildTemplateWorkout(request);
  }

  const { AIWorkoutService } = await import("./ai-service.js");
  return new AIWorkoutService().generateWorkout(request);
}

export async function getOrCreateWorkoutForDate(
  telegramId: number,
  workoutDate: string,
): Promise<WorkoutPlan> {
  await ensureDefaultUser(telegramId);
  const profileUser = await getUser(telegramId);
  const gender = profileUser?.gender ?? null;

  const [user, recent, weeklyCount] = await Promise.all([
    getUser(telegramId),
    getRecentWorkouts(telegramId, 2),
    countCompletedThisWeek(telegramId),
  ]);

  if (!user) {
    throw new Error("User profile not found");
  }

  let existing = await getWorkoutByDate(telegramId, workoutDate);
  if (existing && existing.plan.difficultyLevel !== user.fitnessLevel) {
    await deleteWorkoutByDate(telegramId, workoutDate);
    existing = null;
  }
  if (existing) {
    return {
      ...existing.plan,
      exercises: enrichWorkoutExercises(
        existing.plan.exercises,
        gender,
        user.fitnessLevel,
      ),
      programType: existing.plan.programType ?? "daily",
      difficultyLevel: user.fitnessLevel,
    };
  }

  const split = getSplitForDate(workoutDate, user.language);
  let plan = await generatePlan(user, recent, weeklyCount, split.muscles);
  plan = attachScheduleMeta(plan, workoutDate, user.language);
  plan = {
    ...plan,
    exercises: enrichWorkoutExercises(plan.exercises, user.gender, user.fitnessLevel),
  };
  await saveWorkoutPlan(telegramId, workoutDate, plan);
  return plan;
}

export async function getOrCreateTodayWorkout(telegramId: number): Promise<WorkoutPlan> {
  return getOrCreateWorkoutForDate(telegramId, isoDateOnly());
}

/** Create workouts for the next N days so bot plan and Mini App work immediately. */
export async function prepareWeekWorkouts(telegramId: number, days = 7): Promise<void> {
  await ensureDefaultUser(telegramId);
  const user = await getUser(telegramId);
  if (!user) {
    return;
  }
  const skeleton = buildScheduleDays(user.language, isoDateOnly(), days);
  for (const day of skeleton) {
    try {
      await getOrCreateWorkoutForDate(telegramId, day.date);
    } catch (err) {
      console.warn(`prepareWeekWorkouts ${day.date}:`, err);
    }
  }
}

export async function getWorkoutSchedule(
  telegramId: number,
  days = 7,
): Promise<ScheduleDayItem[]> {
  await ensureDefaultUser(telegramId);
  const user = await getUser(telegramId);
  const locale = user?.language ?? DEFAULT_LOCALE;
  const from = isoDateOnly();
  const skeleton = buildScheduleDays(locale, from, days);

  const items: ScheduleDayItem[] = [];
  for (const day of skeleton) {
    const row = await getWorkoutByDate(telegramId, day.date);
    const previewExercises =
      row?.plan.exercises?.slice(0, 3).map((e) => e.name) ??
      (user ? peekDayPreviewExercises(user, day.date) : []);
    items.push({
      ...day,
      completed: row?.completed ?? false,
      hasWorkout: Boolean(row),
      previewExercises,
    });
  }
  return items;
}

/** Быстрый план для бота (без генерации 7 тренировок — иначе таймаут webhook на Vercel). */
export async function getWeekPlanForBot(
  telegramId: number,
  days = 7,
): Promise<ScheduleDayItem[]> {
  await ensureDefaultUser(telegramId);
  return getWorkoutSchedule(telegramId, days);
}

function peekDayPreviewExercises(user: UserProfile, workoutDate: string): string[] {
  const split = getSplitForDate(workoutDate, user.language);
  const request = buildRequest(user, [], 0, split.muscles);
  const plan = buildTemplateWorkout(request);
  return plan.exercises.slice(0, 3).map((e) => e.name);
}

export async function getGymProgramForUser(telegramId: number) {
  const user = await getUser(telegramId);
  if (!user) {
    throw new Error("User not found");
  }
  if (!isPremiumActive(user)) {
    throw new Error("PREMIUM_REQUIRED");
  }
  const { buildGymProgram } = await import("./gym-program-service.js");
  return buildGymProgram(user);
}

export async function getOrCreateGymWorkoutForDate(
  telegramId: number,
  workoutDate: string,
): Promise<WorkoutPlan> {
  await ensureDefaultUser(telegramId);
  const user = await getUser(telegramId);
  if (!user) {
    throw new Error("User profile not found");
  }
  if (!isPremiumActive(user)) {
    throw new Error("PREMIUM_REQUIRED");
  }

  const { getGymDayPlanForDate, gymDayIndexForDate, buildGymProgram } = await import(
    "./gym-program-service.js"
  );

  let existing = await getWorkoutByDate(telegramId, workoutDate);
  const expectedKey = buildGymProgram(user).days[gymDayIndexForDate(workoutDate)]?.dayKey;

  if (
    existing &&
    (existing.plan.programType !== "gym" ||
      existing.plan.difficultyLevel !== user.fitnessLevel ||
      (expectedKey && existing.plan.gymDayKey && existing.plan.gymDayKey !== expectedKey))
  ) {
    await deleteWorkoutByDate(telegramId, workoutDate);
    existing = null;
  }

  if (existing) {
    return {
      ...existing.plan,
      exercises: enrichWorkoutExercises(
        existing.plan.exercises,
        user.gender,
        user.fitnessLevel,
      ),
      programType: "gym",
      difficultyLevel: user.fitnessLevel,
    };
  }

  const plan = getGymDayPlanForDate(user, workoutDate);
  const enriched = {
    ...plan,
    exercises: enrichWorkoutExercises(plan.exercises, user.gender, user.fitnessLevel),
    difficultyLevel: user.fitnessLevel,
  };
  await saveWorkoutPlan(telegramId, workoutDate, enriched);
  return enriched;
}

export async function getGymWorkoutSchedule(
  telegramId: number,
  days = 7,
): Promise<ScheduleDayItem[]> {
  await ensureDefaultUser(telegramId);
  const user = await getUser(telegramId);
  if (!user) {
    throw new Error("User not found");
  }
  if (!isPremiumActive(user)) {
    throw new Error("PREMIUM_REQUIRED");
  }

  const { buildGymScheduleSkeleton } = await import("./gym-program-service.js");
  const from = isoDateOnly();
  const skeleton = buildGymScheduleSkeleton(user, from, days);
  const items: ScheduleDayItem[] = [];

  for (const day of skeleton) {
    try {
      await getOrCreateGymWorkoutForDate(telegramId, day.date);
    } catch (err) {
      console.warn(`getGymWorkoutSchedule ${day.date}:`, err);
    }
    const row = await getWorkoutByDate(telegramId, day.date);
    items.push({
      ...day,
      completed: row?.completed ?? false,
      hasWorkout: Boolean(row),
      previewExercises: row?.plan.exercises?.slice(0, 3).map((e) => e.name) ?? [],
    });
  }
  return items;
}

export async function canGenerateWorkout(telegramId: number): Promise<boolean> {
  const user = await getUser(telegramId);
  if (user && isPremiumActive(user)) {
    return true;
  }
  const count = await countCompletedThisWeek(telegramId);
  return count < env.FREE_WORKOUTS_PER_WEEK;
}

export function userToApiProfile(user: UserProfile) {
  const bmi =
    user.weightKg && user.heightCm ? calcBmi(user.weightKg, user.heightCm) : null;
  return {
    telegramId: user.telegramId,
    language: user.language,
    fitnessLevel: user.fitnessLevel,
    gender: user.gender,
    age: user.age,
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    bmi,
    trainingMode: user.trainingMode,
    profileComplete: user.profileComplete,
    goals: user.goals,
    timePerSession: user.timePerSession,
    isPremium: isPremiumActive(user),
    premiumUntil: user.premiumUntil,
  };
}

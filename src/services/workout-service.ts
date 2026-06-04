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
import { AIWorkoutService } from "./ai-service.js";
import { buildTemplateWorkout, planMatchesDaySplit } from "./workout-templates.js";
import { gymDayKeyToTargets } from "./exercise-catalog.js";
import { isPremiumActive } from "./premium-service.js";
import { getFreeTierStatus, type FreeTierStatus } from "./free-tier-service.js";
import { enrichWorkoutExercises } from "./exercise-images.js";
import {
  isWorkoutPlanStale,
  withWorkoutPlanVersion,
} from "./workout-plan-version.js";
import { getHomeReadyDay } from "./home-ready-splits.js";
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
    languageChosen: false,
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

  const mode = user.trainingMode === "gym" ? "gym" : "home";

  return {
    userId: String(user.telegramId),
    fitnessLevel: difficulty,
    availableEquipment:
      mode === "gym"
        ? ["barbell", "dumbbell", "machine", "cable", "bodyweight"]
        : ["bodyweight", "home", "none", "chair"],
    timeMinutes: user.timePerSession,
    lastWorkouts: recent,
    targetMuscles,
    language: user.language,
    gender: user.gender,
    age: user.age,
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    bmi,
    trainingMode: mode,
    goals: user.goals,
  };
}

async function generatePlan(
  user: UserProfile,
  recent: WorkoutPlan[],
  weeklyCount: number,
  targetMuscles: string[],
  workoutDate: string,
): Promise<WorkoutPlan> {
  const request = buildRequest(user, recent, weeklyCount, targetMuscles);
  const split = getSplitForDate(workoutDate, user.language);
  const locale = user.language === "en" ? "en" : "ru";
  const homeDay = getHomeReadyDay(workoutDate, locale);
  const ai = new AIWorkoutService();
  return ai.generateWorkout(request, {
    workoutDate,
    splitTitle: split.title,
    dayKey: homeDay.dayKey,
  });
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
  const stale =
    existing &&
    (existing.plan.programType === "gym" ||
      existing.plan.difficultyLevel !== user.fitnessLevel ||
      isWorkoutPlanStale(existing.plan) ||
      !planMatchesDaySplit(existing.plan, workoutDate, user.language));
  if (stale) {
    await deleteWorkoutByDate(telegramId, workoutDate);
    existing = null;
  }
  if (existing) {
    const plan = attachScheduleMeta(
      {
        ...existing.plan,
        exercises: enrichWorkoutExercises(
          existing.plan.exercises,
          gender,
          user.fitnessLevel,
        ),
        programType: "daily",
        difficultyLevel: user.fitnessLevel,
      },
      workoutDate,
      user.language,
    );
    return plan;
  }

  const split = getSplitForDate(workoutDate, user.language);
  let plan = await generatePlan(user, recent, weeklyCount, split.muscles, workoutDate);
  plan = attachScheduleMeta(plan, workoutDate, user.language);
  plan = {
    ...plan,
    exercises: enrichWorkoutExercises(plan.exercises, user.gender, user.fitnessLevel),
  };
  const versioned = withWorkoutPlanVersion(plan);
  await saveWorkoutPlan(telegramId, workoutDate, versioned);
  return versioned;
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

/** Удаляет домашние планы на неделе, не совпадающие со сплитом (или зал в календаре дома). */
export async function cleanupStaleHomeWorkouts(
  telegramId: number,
  days = 7,
): Promise<number> {
  const user = await getUser(telegramId);
  if (!user) {
    return 0;
  }
  const from = isoDateOnly();
  const skeleton = buildScheduleDays(user.language, from, days);
  let removed = 0;
  for (const day of skeleton) {
    const row = await getWorkoutByDate(telegramId, day.date);
    if (!row) {
      continue;
    }
    if (
      row.plan.programType === "gym" ||
      isWorkoutPlanStale(row.plan) ||
      !planMatchesDaySplit(row.plan, day.date, user.language)
    ) {
      await deleteWorkoutByDate(telegramId, day.date);
      removed += 1;
    }
  }
  return removed;
}

export async function getWorkoutSchedule(
  telegramId: number,
  days = 7,
): Promise<ScheduleDayItem[]> {
  await ensureDefaultUser(telegramId);
  const user = await getUser(telegramId);
  const locale = user?.language ?? DEFAULT_LOCALE;
  await cleanupStaleHomeWorkouts(telegramId, days);
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
  const plan = buildTemplateWorkout(request, workoutDate);
  return plan.exercises.slice(0, 3).map((e) => e.name);
}

/** Read-only preview for reminders (no DB write). */
export async function getTodayWorkoutPreview(
  telegramId: number,
  workoutDate: string,
): Promise<{ title: string; exerciseNames: string[] }> {
  await ensureDefaultUser(telegramId);
  const user = await getUser(telegramId);
  if (!user) {
    return { title: "Workout", exerciseNames: [] };
  }
  const row = await getWorkoutByDate(telegramId, workoutDate);
  if (row?.plan.exercises?.length) {
    return {
      title: row.plan.splitDay ?? getSplitForDate(workoutDate, user.language).title,
      exerciseNames: row.plan.exercises.slice(0, 3).map((e) => e.name),
    };
  }
  const split = getSplitForDate(workoutDate, user.language);
  return {
    title: split.title,
    exerciseNames: peekDayPreviewExercises(user, workoutDate),
  };
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

  const { gymDayIndexForDate, buildGymProgram, attachGymScheduleMeta } = await import(
    "./gym-program-service.js"
  );

  const program = buildGymProgram(user);
  const idx = gymDayIndexForDate(workoutDate);
  const slot = program.days[idx] ?? program.days[0];
  const expectedKey = slot.dayKey;

  let existing = await getWorkoutByDate(telegramId, workoutDate);

  if (
    existing &&
    (existing.plan.programType !== "gym" ||
      existing.plan.difficultyLevel !== user.fitnessLevel ||
      isWorkoutPlanStale(existing.plan) ||
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

  const [recent, weeklyCount] = await Promise.all([
    getRecentWorkouts(telegramId, 2),
    countCompletedThisWeek(telegramId),
  ]);
  const targetMuscles = gymDayKeyToTargets(slot.dayKey);
  const request = buildRequest(user, recent, weeklyCount, targetMuscles);
  request.trainingMode = "gym";

  const ai = new AIWorkoutService();
  let plan = await ai.generateWorkout(request, {
    workoutDate,
    splitTitle: slot.dayLabel,
    dayKey: slot.dayKey,
  });
  plan = attachGymScheduleMeta(
    plan,
    workoutDate,
    user.language,
    slot.dayLabel,
    slot.focus,
    slot.dayKey,
  );
  const enriched = {
    ...plan,
    exercises: enrichWorkoutExercises(plan.exercises, user.gender, user.fitnessLevel),
    difficultyLevel: user.fitnessLevel,
    programType: "gym" as const,
    gymDayKey: slot.dayKey,
  };
  const versioned = withWorkoutPlanVersion(enriched);
  await saveWorkoutPlan(telegramId, workoutDate, versioned);
  return versioned;
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
    remindersEnabled: user.remindersEnabled,
    reminderHour: user.reminderHour,
    timezoneOffsetMinutes: user.timezoneOffsetMinutes,
    restPreset: user.restPreset,
  };
}

export type ApiUserProfile = ReturnType<typeof userToApiProfile> & {
  freeWeeklyLimit: number;
  completedWorkoutsThisWeek: number;
  canStartNewWorkout: boolean;
  freeWorkoutsRemaining: number | null;
};

export async function buildApiUserProfile(user: UserProfile): Promise<ApiUserProfile> {
  const free = await getFreeTierStatus(user.telegramId);
  return {
    ...userToApiProfile(user),
    ...freeTierToApi(free),
  };
}

export function freeTierToApi(free: FreeTierStatus): Pick<
  ApiUserProfile,
  | "freeWeeklyLimit"
  | "completedWorkoutsThisWeek"
  | "canStartNewWorkout"
  | "freeWorkoutsRemaining"
> {
  return {
    freeWeeklyLimit: free.weeklyLimit,
    completedWorkoutsThisWeek: free.completedThisWeek,
    canStartNewWorkout: free.canStartNewWorkout,
    freeWorkoutsRemaining: free.isPremium ? null : free.remaining,
  };
}

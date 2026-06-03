import { env } from "../config/env.js";
import { DEFAULT_LOCALE } from "../types/locale.js";
import { getUser, upsertUser } from "../database/users-repo.js";
import {
  countCompletedThisWeek,
  getRecentWorkouts,
  getWorkoutByDate,
  saveWorkoutPlan,
} from "../database/workouts-repo.js";
import { FitnessLevel, WorkoutPlan } from "../types/workout.js";
import { buildTemplateWorkout } from "./workout-templates.js";

function muscleRotationFromHistory(history: WorkoutPlan[]): string[] {
  const cycle = [
    ["chest", "triceps", "shoulders"],
    ["back", "biceps"],
    ["legs", "glutes", "core"],
  ];
  return cycle[history.length % cycle.length] ?? cycle[0];
}

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
    timePerSession: 25,
    isPremium: false,
    language: DEFAULT_LOCALE,
  });
}

function adjustDifficulty(
  currentLevel: FitnessLevel,
  completedThisWeek: number,
): FitnessLevel {
  if (completedThisWeek < 2) {
    return currentLevel;
  }
  if (currentLevel === "beginner" && completedThisWeek >= 4) {
    return "intermediate";
  }
  if (currentLevel === "intermediate" && completedThisWeek >= 5) {
    return "advanced";
  }
  return currentLevel;
}

async function generatePlan(
  telegramId: number,
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>,
  recent: WorkoutPlan[],
  weeklyCount: number,
): Promise<WorkoutPlan> {
  const difficulty = adjustDifficulty(user.fitnessLevel, weeklyCount);
  const request = {
    userId: String(telegramId),
    fitnessLevel: difficulty,
    availableEquipment: user.availableEquipment,
    timeMinutes: user.timePerSession,
    lastWorkouts: recent,
    targetMuscles: muscleRotationFromHistory(recent),
    language: user.language,
  };

  if (!env.USE_AI_WORKOUTS) {
    return buildTemplateWorkout(request);
  }

  const { AIWorkoutService } = await import("./ai-service.js");
  return new AIWorkoutService().generateWorkout(request);
}

export async function getOrCreateTodayWorkout(telegramId: number): Promise<WorkoutPlan> {
  const today = new Date().toISOString().slice(0, 10);

  const existing = await getWorkoutByDate(telegramId, today);
  if (existing) {
    return existing.plan;
  }

  await ensureDefaultUser(telegramId);

  const [user, recent, weeklyCount] = await Promise.all([
    getUser(telegramId),
    getRecentWorkouts(telegramId, 2),
    countCompletedThisWeek(telegramId),
  ]);

  if (!user) {
    throw new Error("User profile not found");
  }

  const plan = await generatePlan(telegramId, user, recent, weeklyCount);
  await saveWorkoutPlan(telegramId, today, plan);
  return plan;
}

export async function canGenerateWorkout(telegramId: number): Promise<boolean> {
  const user = await getUser(telegramId);
  if (user?.isPremium) {
    return true;
  }
  const count = await countCompletedThisWeek(telegramId);
  return count < env.FREE_WORKOUTS_PER_WEEK;
}

import { env } from "../config/env.js";
import { db } from "../database/index.js";
import { DEFAULT_LOCALE } from "../types/locale.js";
import { getUser, upsertUser } from "../database/users-repo.js";
import {
  countCompletedThisWeek,
  getRecentWorkouts,
  getWorkoutByDate,
  saveWorkoutPlan,
} from "../database/workouts-repo.js";
import { FitnessLevel, WorkoutPlan } from "../types/workout.js";
import { AIWorkoutService } from "./ai-service.js";

const aiService = new AIWorkoutService();

async function ensureLanguageColumn(): Promise<void> {
  await db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(5);
    UPDATE users SET language = 'ru' WHERE language IS NULL;
  `);
}

export async function ensureDefaultUser(telegramId: number): Promise<void> {
  await ensureLanguageColumn();
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

function muscleRotationFromHistory(history: WorkoutPlan[]): string[] {
  const cycle = [
    ["chest", "triceps", "shoulders"],
    ["back", "biceps"],
    ["legs", "glutes", "core"],
  ];
  return cycle[history.length % cycle.length] ?? cycle[0];
}

export async function getOrCreateTodayWorkout(telegramId: number): Promise<WorkoutPlan> {
  await ensureDefaultUser(telegramId);
  const today = new Date().toISOString().slice(0, 10);
  const existing = await getWorkoutByDate(telegramId, today);
  if (existing) {
    return existing.plan;
  }

  const user = await getUser(telegramId);
  if (!user) {
    throw new Error("User profile not found");
  }
  const recent = await getRecentWorkouts(telegramId, 5);
  const weeklyCount = await countCompletedThisWeek(telegramId);
  const difficulty = adjustDifficulty(user.fitnessLevel, weeklyCount);

  const plan = await aiService.generateWorkout({
    userId: String(telegramId),
    fitnessLevel: difficulty,
    availableEquipment: user.availableEquipment,
    timeMinutes: user.timePerSession,
    lastWorkouts: recent,
    targetMuscles: muscleRotationFromHistory(recent),
    language: user.language,
  });

  await saveWorkoutPlan(telegramId, today, plan);
  return plan;
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

export async function canGenerateWorkout(telegramId: number): Promise<boolean> {
  const user = await getUser(telegramId);
  if (user?.isPremium) {
    return true;
  }
  const count = await countCompletedThisWeek(telegramId);
  return count < env.FREE_WORKOUTS_PER_WEEK;
}

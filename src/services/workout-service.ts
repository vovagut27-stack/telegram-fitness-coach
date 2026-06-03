import { env } from "../config/env.js";
import { DEFAULT_LOCALE } from "../types/locale.js";
import { calcBmi } from "../types/profile.js";
import { getUser, upsertUser, type UserProfile } from "../database/users-repo.js";
import {
  countCompletedThisWeek,
  getRecentWorkouts,
  getWorkoutByDate,
  saveWorkoutPlan,
} from "../database/workouts-repo.js";
import { FitnessLevel, WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { buildTemplateWorkout } from "./workout-templates.js";
import { getTodayGymWorkout, buildGymProgram } from "./gym-program-service.js";
import { isPremiumActive } from "./premium-service.js";

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

function buildRequest(
  user: UserProfile,
  recent: WorkoutPlan[],
  weeklyCount: number,
): WorkoutRequest {
  const difficulty = adjustDifficulty(user.fitnessLevel, weeklyCount);
  const bmi =
    user.weightKg && user.heightCm ? calcBmi(user.weightKg, user.heightCm) : null;

  return {
    userId: String(user.telegramId),
    fitnessLevel: difficulty,
    availableEquipment: user.availableEquipment,
    timeMinutes: user.timePerSession,
    lastWorkouts: recent,
    targetMuscles: muscleRotationFromHistory(recent),
    language: user.language,
    gender: user.gender,
    age: user.age,
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    bmi,
    trainingMode: user.trainingMode,
    goals: user.goals,
  };
}

async function generatePlan(user: UserProfile, recent: WorkoutPlan[], weeklyCount: number): Promise<WorkoutPlan> {
  const premium = isPremiumActive(user);

  if (premium && user.trainingMode === "gym") {
    return getTodayGymWorkout(user);
  }

  const request = buildRequest(user, recent, weeklyCount);
  const useAi =
    env.USE_AI_WORKOUTS || (premium && user.profileComplete) || user.profileComplete;

  if (!useAi) {
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

  const plan = await generatePlan(user, recent, weeklyCount);
  await saveWorkoutPlan(telegramId, today, plan);
  return plan;
}

export async function getGymProgramForUser(telegramId: number) {
  const user = await getUser(telegramId);
  if (!user) {
    throw new Error("User not found");
  }
  if (!isPremiumActive(user)) {
    throw new Error("PREMIUM_REQUIRED");
  }
  return buildGymProgram(user);
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

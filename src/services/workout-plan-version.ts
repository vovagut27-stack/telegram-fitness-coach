import type { WorkoutPlan } from "../types/workout.js";

/** Увеличивайте при смене каталога упражнений / логики сплита — старые планы в БД сбросятся. */
export const WORKOUT_PLAN_VERSION = 4;

export function isWorkoutPlanStale(plan: WorkoutPlan): boolean {
  return (plan.planVersion ?? 1) < WORKOUT_PLAN_VERSION;
}

export function withWorkoutPlanVersion(plan: WorkoutPlan): WorkoutPlan {
  return { ...plan, planVersion: WORKOUT_PLAN_VERSION };
}

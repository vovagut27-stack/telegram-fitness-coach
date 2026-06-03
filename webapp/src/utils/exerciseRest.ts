import type { FitnessLevel, WorkoutExercise } from "../types";

/** Отдых уже посчитан на бэкенде — не масштабируем повторно. */
export function effectiveRestSeconds(
  exercise: WorkoutExercise,
  _planLevel: FitnessLevel = "beginner",
): number {
  return Math.min(120, Math.max(35, exercise.restSeconds || 60));
}

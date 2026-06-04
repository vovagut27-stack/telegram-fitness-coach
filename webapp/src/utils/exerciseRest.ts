import type { FitnessLevel, WorkoutExercise } from "../types";

/** Отдых уже посчитан на бэкенде — не масштабируем повторно. */
export function effectiveRestSeconds(
  exercise: WorkoutExercise,
  _planLevel: FitnessLevel = "beginner",
  restPreset: "short" | "normal" | "long" = "normal",
): number {
  const mult = restPreset === "short" ? 0.85 : restPreset === "long" ? 1.2 : 1;
  const base = exercise.restSeconds || 60;
  return Math.min(120, Math.max(30, Math.round(base * mult)));
}

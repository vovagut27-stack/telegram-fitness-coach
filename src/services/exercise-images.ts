import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise } from "../types/workout.js";
import { applyExerciseRest } from "./exercise-rest.js";
import { illustrationAssetPath } from "./exercise-illustrations.js";
import {
  resolveExerciseVisualUrl,
  resolveMovementFallbackUrl,
} from "./exercise-visual-catalog.js";

/** Primary image — local SVG on webapp origin (works in Telegram WebView). */
export function resolveExerciseImageUrl(
  name: string,
  _gender?: Gender | null,
  _equipment?: string,
): string {
  return illustrationAssetPath(name);
}

/** Optional second URL (wger / pexels) if primary fails in client. */
export function resolveExerciseImageAltUrl(
  name: string,
  gender?: Gender | null,
  equipment?: string,
): string {
  return resolveExerciseVisualUrl(name, gender, equipment);
}

export function enrichExerciseImage(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): WorkoutExercise {
  const equipment = exercise.equipment ?? "";
  return {
    ...exercise,
    demoUrl: resolveExerciseImageUrl(exercise.name, gender, equipment),
    imageFallback: resolveExerciseImageAltUrl(exercise.name, gender, equipment),
  };
}

export function enrichWorkoutExercises(
  exercises: WorkoutExercise[],
  gender?: Gender | null,
  fitnessLevel: FitnessLevel = "beginner",
): WorkoutExercise[] {
  return exercises.map((ex) => applyExerciseRest(enrichExerciseImage(ex, gender), fitnessLevel));
}

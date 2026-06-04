import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise } from "../types/workout.js";
import { applyExerciseRest } from "./exercise-rest.js";
import { lookupExercisePhoto } from "./exercise-image-catalog.js";
import {
  resolveExerciseVisualUrl,
  resolveMovementFallbackUrl,
} from "./exercise-visual-catalog.js";

/** Primary image for Mini App — Unsplash/catalog (wger often blocked in Telegram WebView). */
export function resolveExerciseImageUrl(
  name: string,
  gender?: Gender | null,
  equipment?: string,
): string {
  return (
    lookupExercisePhoto(name) ??
    resolveMovementFallbackUrl(name, gender, equipment)
  );
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

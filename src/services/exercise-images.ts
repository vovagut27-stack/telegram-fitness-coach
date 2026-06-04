import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise } from "../types/workout.js";
import { applyExerciseRest } from "./exercise-rest.js";
import { lookupExercisePhoto } from "./exercise-image-catalog.js";
import { illustrationAssetPath } from "./exercise-illustrations.js";
import { resolveExerciseVisualUrl } from "./exercise-visual-catalog.js";

/** Основное фото / иллюстрация с человеком (wger, Pexels, Unsplash). */
export function resolveExerciseImageUrl(
  name: string,
  gender?: Gender | null,
  equipment?: string,
): string {
  return (
    lookupExercisePhoto(name) ??
    resolveExerciseVisualUrl(name, gender, equipment)
  );
}

/** Запас — схема SVG на своём домене, если CDN не открылся. */
export function resolveExerciseImageAltUrl(
  name: string,
  gender?: Gender | null,
  equipment?: string,
): string {
  return illustrationAssetPath(name);
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

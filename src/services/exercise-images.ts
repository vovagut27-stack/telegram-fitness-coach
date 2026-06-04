import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise } from "../types/workout.js";
import { applyExerciseRest } from "./exercise-rest.js";
import { lookupExercisePhoto } from "./exercise-image-catalog.js";
import { illustrationAssetPath } from "./exercise-illustrations.js";

/**
 * Основная картинка — SVG по названию упражнения (всегда верное движение).
 * Generic Unsplash по «типу движения» давал становую/скручивания не к месту.
 */
export function resolveExerciseImageUrl(
  name: string,
  _gender?: Gender | null,
  _equipment?: string,
): string {
  return illustrationAssetPath(name);
}

/** Опциональное фото — только если есть точная запись в каталоге. */
export function resolveExerciseImageAltUrl(
  name: string,
  _gender?: Gender | null,
  _equipment?: string,
): string | undefined {
  return lookupExercisePhoto(name);
}

export function enrichExerciseImage(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): WorkoutExercise {
  const alt = resolveExerciseImageAltUrl(exercise.name, gender, exercise.equipment);
  return {
    ...exercise,
    demoUrl: resolveExerciseImageUrl(exercise.name, gender, exercise.equipment),
    imageFallback: alt,
  };
}

export function enrichWorkoutExercises(
  exercises: WorkoutExercise[],
  gender?: Gender | null,
  fitnessLevel: FitnessLevel = "beginner",
): WorkoutExercise[] {
  return exercises.map((ex) => applyExerciseRest(enrichExerciseImage(ex, gender), fitnessLevel));
}

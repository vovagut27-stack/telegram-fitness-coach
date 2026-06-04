import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise } from "../types/workout.js";
import { applyExerciseRest } from "./exercise-rest.js";
import { lookupExercisePhoto } from "./exercise-image-catalog.js";
import {
  illustrationAssetPath,
  illustrationSlugForExercise,
} from "./exercise-illustrations.js";
import { resolveExerciseVisualUrl } from "./exercise-visual-catalog.js";

function isBundledExercisePhoto(url: string): boolean {
  return url.startsWith("/exercises/photos/");
}

/** Локальное фото (зал) → SVG по названию → Unsplash. */
export function resolveExerciseImageUrl(
  name: string,
  gender?: Gender | null,
  equipment?: string,
): string {
  const photo = lookupExercisePhoto(name);
  if (photo && isBundledExercisePhoto(photo)) {
    return photo;
  }
  if (illustrationSlugForExercise(name) !== "generic-workout") {
    return illustrationAssetPath(name);
  }
  return photo ?? resolveExerciseVisualUrl(name, gender, equipment);
}

export function resolveExerciseImageAltUrl(
  name: string,
  _gender?: Gender | null,
  _equipment?: string,
): string {
  return illustrationAssetPath(name);
}

export function enrichExerciseImage(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): WorkoutExercise {
  return {
    ...exercise,
    demoUrl: resolveExerciseImageUrl(exercise.name, gender, exercise.equipment),
    imageFallback: resolveExerciseImageAltUrl(exercise.name, gender, exercise.equipment),
  };
}

export function enrichWorkoutExercises(
  exercises: WorkoutExercise[],
  gender?: Gender | null,
  fitnessLevel: FitnessLevel = "beginner",
): WorkoutExercise[] {
  return exercises.map((ex) => applyExerciseRest(enrichExerciseImage(ex, gender), fitnessLevel));
}

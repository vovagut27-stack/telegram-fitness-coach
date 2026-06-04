import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise } from "../types/workout.js";
import { applyExerciseRest } from "./exercise-rest.js";
import {
  buildExercisePhotoCandidates,
  resolvePrimaryExercisePhoto,
  resolveSecondaryExercisePhoto,
} from "./exercise-photo-urls.js";

/** Только фото (Unsplash / локальные PNG), без SVG. */
export function resolveExerciseImageUrl(
  name: string,
  gender?: Gender | null,
  equipment?: string,
): string {
  return resolvePrimaryExercisePhoto(name, { gender, equipment });
}

export function resolveExerciseImageAltUrl(
  name: string,
  gender?: Gender | null,
  equipment?: string,
): string {
  return resolveSecondaryExercisePhoto(name, { gender, equipment });
}

export function enrichExerciseImage(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): WorkoutExercise {
  const opts = { gender, equipment: exercise.equipment };
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

export { buildExercisePhotoCandidates };

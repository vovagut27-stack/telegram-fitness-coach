import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise } from "../types/workout.js";
import { applyExerciseRest } from "./exercise-rest.js";
import { lookupExercisePhoto } from "./exercise-image-catalog.js";
import { resolveExerciseVisualUrl } from "./exercise-visual-catalog.js";

export function resolveExerciseImageUrl(
  name: string,
  gender?: Gender | null,
  _equipment?: string,
): string {
  const photo = lookupExercisePhoto(name);
  if (photo) {
    return photo;
  }
  return resolveExerciseVisualUrl(name, gender);
}

export function enrichExerciseImage(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): WorkoutExercise {
  return {
    ...exercise,
    demoUrl: resolveExerciseImageUrl(exercise.name, gender, exercise.equipment),
  };
}

export function enrichWorkoutExercises(
  exercises: WorkoutExercise[],
  gender?: Gender | null,
  fitnessLevel: FitnessLevel = "beginner",
): WorkoutExercise[] {
  return exercises.map((ex) => applyExerciseRest(enrichExerciseImage(ex, gender), fitnessLevel));
}

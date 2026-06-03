import type { Gender } from "../types/profile.js";
import type { WorkoutExercise } from "../types/workout.js";
import { resolveExerciseVisualUrl } from "./exercise-visual-catalog.js";

export function resolveExerciseImageUrl(
  name: string,
  gender?: Gender | null,
  _equipment?: string,
): string {
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
): WorkoutExercise[] {
  return exercises.map((ex) => enrichExerciseImage(ex, gender));
}

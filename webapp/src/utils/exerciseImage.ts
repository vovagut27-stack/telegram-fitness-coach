import type { Gender, WorkoutExercise } from "../types";
import { getApiBase } from "../config";
import {
  buildExercisePhotoCandidates,
  GENERIC_EXERCISE_PHOTO,
} from "@shared/exercise-photo-urls";

/** Только фото — без SVG. */
export function exerciseImageCandidates(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): string[] {
  return buildExercisePhotoCandidates(exercise.name, {
    gender: gender ?? null,
    equipment: exercise.equipment,
    demoUrl: exercise.demoUrl,
    apiBase: getApiBase(),
  });
}

export function resolveExerciseImageSrc(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): string {
  return exerciseImageCandidates(exercise, gender)[0] ?? GENERIC_EXERCISE_PHOTO;
}

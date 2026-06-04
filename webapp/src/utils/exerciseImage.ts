import type { Gender, WorkoutExercise } from "../types";
import { illustrationAssetPath } from "@shared/exercise-illustrations";
import { resolveLocalExerciseAsset } from "./exerciseIllustration";

function svgUrlForExercise(name: string): string {
  return resolveLocalExerciseAsset(illustrationAssetPath(name));
}

/** Только SVG по названию — без generic/stale фото из CDN. */
export function exerciseImageCandidates(
  exercise: WorkoutExercise,
  _gender?: Gender | null,
): string[] {
  return [svgUrlForExercise(exercise.name)];
}

export function resolveExerciseImageSrc(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): string {
  return exerciseImageCandidates(exercise, gender)[0] ?? svgUrlForExercise(exercise.name);
}

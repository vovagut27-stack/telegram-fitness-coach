import type { Gender, WorkoutExercise } from "../types";
import { getApiBase } from "../config";
import { lookupExercisePhoto } from "./exercisePhotoCatalog";
import {
  illustrationAssetPath,
  illustrationSlugForExercise,
} from "@shared/exercise-illustrations";
import { resolveExerciseVisualUrl } from "@shared/exercise-visual-catalog";
import { isLocalExerciseIllustration } from "./exerciseIllustration";

const GENERIC_PHOTO =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80&auto=format&fit=crop";

function isBundledExercisePhoto(url: string): boolean {
  return url.startsWith("/exercises/photos/");
}

function exercisePhotoProxyUrl(
  name: string,
  gender?: Gender | null,
  equipment?: string,
): string {
  const params = new URLSearchParams({ name });
  if (gender) {
    params.set("gender", gender);
  }
  if (equipment) {
    params.set("equipment", equipment);
  }
  return `${getApiBase()}/media/exercise-photo?${params.toString()}`;
}

function hasAccurateIllustration(name: string): boolean {
  return illustrationSlugForExercise(name) !== "generic-workout";
}

/** Локальное фото (зал) → SVG по упражнению → Unsplash. */
export function exerciseImageCandidates(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): string[] {
  const urls: string[] = [];
  const add = (url?: string): void => {
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  };

  const exactPhoto = lookupExercisePhoto(exercise.name);
  const illustration = illustrationAssetPath(exercise.name);
  const useIllustrationFirst = hasAccurateIllustration(exercise.name);

  if (exactPhoto && isBundledExercisePhoto(exactPhoto)) {
    add(exactPhoto);
  } else if (useIllustrationFirst) {
    add(illustration);
  } else {
    add(
      exercisePhotoProxyUrl(exercise.name, gender ?? null, exercise.equipment),
    );
    add(exactPhoto);
  }

  const demo = exercise.demoUrl;
  if (
    demo &&
    !isLocalExerciseIllustration(demo) &&
    demo !== exactPhoto &&
    !(useIllustrationFirst && demo.includes("unsplash.com"))
  ) {
    add(demo);
  }

  if (!useIllustrationFirst) {
    add(illustration);
  }

  if (!useIllustrationFirst) {
    add(resolveExerciseVisualUrl(exercise.name, gender ?? null, exercise.equipment));
  }

  add(GENERIC_PHOTO);

  return urls;
}

export function resolveExerciseImageSrc(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): string {
  return exerciseImageCandidates(exercise, gender)[0] ?? GENERIC_PHOTO;
}

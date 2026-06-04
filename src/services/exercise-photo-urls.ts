import type { Gender } from "../types/profile.js";
import { lookupExercisePhoto } from "./exercise-image-catalog.js";
import { resolveExerciseVisualUrl } from "./exercise-visual-catalog.js";

export const GENERIC_EXERCISE_PHOTO =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80&auto=format&fit=crop";

export function isBundledExercisePhoto(url: string): boolean {
  return url.startsWith("/exercises/photos/");
}

/** Только растровые фото (без SVG). */
export function isRasterPhotoUrl(url: string): boolean {
  if (!url || url.startsWith("data:image/svg")) {
    return false;
  }
  return !/\.svg(\?|$)/i.test(url);
}

export function exercisePhotoProxyPath(
  apiBase: string,
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
  const base = apiBase.replace(/\/$/, "");
  return `${base}/media/exercise-photo?${params.toString()}`;
}

export interface PhotoCandidateOptions {
  gender?: Gender | null;
  equipment?: string;
  demoUrl?: string;
  /** Mini App: прокси через backend. API enrich — прямой Unsplash. */
  apiBase?: string;
}

/** Цепочка только из фото: локальные PNG → каталог / прокси → движение → generic. */
export function buildExercisePhotoCandidates(
  name: string,
  options: PhotoCandidateOptions = {},
): string[] {
  const { gender, equipment, demoUrl, apiBase } = options;
  const urls: string[] = [];
  const add = (url?: string): void => {
    if (url && isRasterPhotoUrl(url) && !urls.includes(url)) {
      urls.push(url);
    }
  };

  const exactPhoto = lookupExercisePhoto(name);

  if (exactPhoto && isBundledExercisePhoto(exactPhoto)) {
    add(exactPhoto);
  } else {
    if (apiBase) {
      add(exercisePhotoProxyPath(apiBase, name, gender, equipment));
    }
    add(exactPhoto);
  }

  add(demoUrl);
  add(resolveExerciseVisualUrl(name, gender, equipment));
  add(GENERIC_EXERCISE_PHOTO);

  return urls;
}

export function resolvePrimaryExercisePhoto(
  name: string,
  options: PhotoCandidateOptions = {},
): string {
  return buildExercisePhotoCandidates(name, options)[0] ?? GENERIC_EXERCISE_PHOTO;
}

export function resolveSecondaryExercisePhoto(
  name: string,
  options: PhotoCandidateOptions = {},
): string {
  const list = buildExercisePhotoCandidates(name, options);
  return list[1] ?? list[0] ?? GENERIC_EXERCISE_PHOTO;
}

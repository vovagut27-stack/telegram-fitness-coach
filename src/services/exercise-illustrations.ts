import { normalizeExerciseName } from "./exercise-image-catalog.js";

/** Локальные SVG в webapp/public/exercises/ — анатомический стиль, грузятся в Telegram. */
export type IllustrationSlug =
  | "push-up"
  | "knee-push-up"
  | "plank"
  | "side-plank"
  | "lunge"
  | "squat"
  | "burpee"
  | "jumping-jack"
  | "high-knees"
  | "shoulder-rotation"
  | "arm-raise"
  | "stretch"
  | "cat-cow"
  | "bird-dog"
  | "glute-bridge"
  | "superman";

const EXACT_SLUG: Record<string, IllustrationSlug> = {
  [normalizeExerciseName("Отжимания от пола")]: "push-up",
  [normalizeExerciseName("Standard push-ups")]: "push-up",
  [normalizeExerciseName("Отжимания с колен")]: "knee-push-up",
  [normalizeExerciseName("Knee push-ups")]: "knee-push-up",
  [normalizeExerciseName("Отжимания узким хватом")]: "push-up",
  [normalizeExerciseName("Close-grip push-ups")]: "push-up",
  [normalizeExerciseName("Планка")]: "plank",
  [normalizeExerciseName("Plank hold")]: "plank",
  [normalizeExerciseName("Боковая планка")]: "side-plank",
  [normalizeExerciseName("Side plank")]: "side-plank",
  [normalizeExerciseName("Прыжки с разведением рук")]: "jumping-jack",
  [normalizeExerciseName("Jumping jacks")]: "jumping-jack",
  [normalizeExerciseName("Бёрпи")]: "burpee",
  [normalizeExerciseName("Burpees")]: "burpee",
  [normalizeExerciseName("Бег с высоким подниманием колена")]: "high-knees",
  [normalizeExerciseName("High knees")]: "high-knees",
  [normalizeExerciseName("Вращения плечами")]: "shoulder-rotation",
  [normalizeExerciseName("Shoulder circles")]: "shoulder-rotation",
  [normalizeExerciseName("Махи руками в стороны")]: "arm-raise",
  [normalizeExerciseName("Lateral arm raises")]: "arm-raise",
  [normalizeExerciseName("Подъёмы рук в стороны")]: "arm-raise",
  [normalizeExerciseName("Приседания")]: "squat",
  [normalizeExerciseName("Bodyweight squats")]: "squat",
  [normalizeExerciseName("Выпады назад")]: "lunge",
  [normalizeExerciseName("Reverse lunges")]: "lunge",
  [normalizeExerciseName("Выпады вперёд")]: "lunge",
  [normalizeExerciseName("Forward lunges")]: "lunge",
  [normalizeExerciseName("Выпады с прыжком")]: "lunge",
  [normalizeExerciseName("Jumping lunges")]: "lunge",
  [normalizeExerciseName("Ягодичный мост")]: "glute-bridge",
  [normalizeExerciseName("Glute bridge")]: "glute-bridge",
  [normalizeExerciseName("Супермен")]: "superman",
  [normalizeExerciseName("Superman hold")]: "superman",
  [normalizeExerciseName("Птица-собака")]: "bird-dog",
  [normalizeExerciseName("Bird-dog")]: "bird-dog",
  [normalizeExerciseName("Растяжка «кошка-корова»")]: "cat-cow",
  [normalizeExerciseName("Cat-cow stretch")]: "cat-cow",
  [normalizeExerciseName("Наклон вперёд стоя")]: "stretch",
  [normalizeExerciseName("Standing forward fold")]: "stretch",
  [normalizeExerciseName("Растяжка плеч")]: "stretch",
  [normalizeExerciseName("Shoulder stretch")]: "stretch",
};

const PATTERNS: Array<{ pattern: RegExp; slug: IllustrationSlug }> = [
  { pattern: /отжим|push.?up/i, slug: "push-up" },
  { pattern: /колен|knee push/i, slug: "knee-push-up" },
  { pattern: /планк|plank/i, slug: "plank" },
  { pattern: /боков.*планк|side plank/i, slug: "side-plank" },
  { pattern: /выпад|lunge/i, slug: "lunge" },
  { pattern: /присед|squat/i, slug: "squat" },
  { pattern: /бёрпи|burpee/i, slug: "burpee" },
  { pattern: /прыжк.*развед|jumping jack/i, slug: "jumping-jack" },
  { pattern: /высок.*колен|high knee/i, slug: "high-knees" },
  { pattern: /вращен|circle/i, slug: "shoulder-rotation" },
  { pattern: /мах|raise/i, slug: "arm-raise" },
  { pattern: /кошка|cat.?cow/i, slug: "cat-cow" },
  { pattern: /растяж|stretch|наклон/i, slug: "stretch" },
  { pattern: /птиц|bird/i, slug: "bird-dog" },
  { pattern: /мост|bridge/i, slug: "glute-bridge" },
  { pattern: /супермен|superman/i, slug: "superman" },
];

export function illustrationSlugForExercise(name: string): IllustrationSlug {
  const key = normalizeExerciseName(name);
  if (EXACT_SLUG[key]) {
    return EXACT_SLUG[key];
  }
  const n = name.toLowerCase();
  for (const { pattern, slug } of PATTERNS) {
    if (pattern.test(n)) {
      return slug;
    }
  }
  return "push-up";
}

/** Путь на статику Mini App (тот же origin, что и webapp). */
export function illustrationAssetPath(name: string): string {
  const slug = illustrationSlugForExercise(name);
  return `/exercises/${slug}.svg`;
}

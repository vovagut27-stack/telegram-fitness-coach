import type { Gender } from "../types/profile.js";
import { normalizeExerciseName } from "./exercise-image-catalog.js";

/** Illustrations (wger) — neutral / male. Female — studio photos on light background. */
export type MovementKey =
  | "push"
  | "pull"
  | "squat"
  | "lunge"
  | "hinge"
  | "plank"
  | "core"
  | "curl"
  | "row"
  | "press"
  | "fly"
  | "triceps"
  | "calf"
  | "cardio"
  | "bridge"
  | "default";

const WGER = {
  push: "https://wger.de/media/exercise-images/195/Push-ups-2.png",
  pull: "https://wger.de/media/exercise-images/108/Pull-ups-2.png",
  squat: "https://wger.de/media/exercise-images/131/Squats-2.png",
  lunge: "https://wger.de/media/exercise-images/158/Lunges-2.png",
  hinge: "https://wger.de/media/exercise-images/24/Dead-lifts-2.png",
  plank: "https://wger.de/media/exercise-images/97/Plank-2.png",
  core: "https://wger.de/media/exercise-images/91/Crunches-1.png",
  curl: "https://wger.de/media/exercise-images/74/Bicep-curls-1.png",
  row: "https://wger.de/media/exercise-images/109/Bent-over-barbell-rows-1.png",
  press: "https://wger.de/media/exercise-images/192/Bench-press-1.png",
  fly: "https://wger.de/media/exercise-images/122/Dumbbell-flyes-1.png",
  triceps: "https://wger.de/media/exercise-images/83/Triceps-dips-1.png",
  calf: "https://wger.de/media/exercise-images/206/Standing-calf-raises-2.png",
  cardio: "https://wger.de/media/exercise-images/369/Burpees-1.png",
  bridge: "https://wger.de/media/exercise-images/898/Hip-thrust-1.png",
  default: "https://wger.de/media/exercise-images/131/Squats-2.png",
} as const;

/** Female: clean instructional photos (light background). */
const FEMALE = {
  push: "https://images.pexels.com/photos/4064432/pexels-photo-4064432.jpeg?auto=compress&cs=tinysrgb&w=720",
  pull: "https://images.pexels.com/photos/4753873/pexels-photo-4753873.jpeg?auto=compress&cs=tinysrgb&w=720",
  squat: "https://images.pexels.com/photos/6550858/pexels-photo-6550858.jpeg?auto=compress&cs=tinysrgb&w=720",
  lunge: "https://images.pexels.com/photos/3775164/pexels-photo-3775164.jpeg?auto=compress&cs=tinysrgb&w=720",
  hinge: "https://images.pexels.com/photos/6389508/pexels-photo-6389508.jpeg?auto=compress&cs=tinysrgb&w=720",
  plank: "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=720",
  core: "https://images.pexels.com/photos/3207833/pexels-photo-3207833.jpeg?auto=compress&cs=tinysrgb&w=720",
  curl: "https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=720",
  row: "https://images.pexels.com/photos/4753873/pexels-photo-4753873.jpeg?auto=compress&cs=tinysrgb&w=720",
  press: "https://images.pexels.com/photos/17840/pexels-photo-17840.jpeg?auto=compress&cs=tinysrgb&w=720",
  fly: "https://images.pexels.com/photos/2072941/pexels-photo-2072941.jpeg?auto=compress&cs=tinysrgb&w=720",
  triceps: "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=720",
  calf: "https://images.pexels.com/photos/6550858/pexels-photo-6550858.jpeg?auto=compress&cs=tinysrgb&w=720",
  cardio: "https://images.pexels.com/photos/3823037/pexels-photo-3823037.jpeg?auto=compress&cs=tinysrgb&w=720",
  bridge: "https://images.pexels.com/photos/3775164/pexels-photo-3775164.jpeg?auto=compress&cs=tinysrgb&w=720",
  default: "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=720",
} as const;

const NAME_TO_MOVEMENT: Array<{ pattern: RegExp; key: MovementKey }> = [
  { pattern: /push.?up|отжим|dip|обратн.*отжим/i, key: "push" },
  { pattern: /pull.?up|подтяг|chin/i, key: "pull" },
  { pattern: /plank|планк/i, key: "plank" },
  { pattern: /squat|присед|жим ног|leg press/i, key: "squat" },
  { pattern: /lunge|выпад|пистолет|split/i, key: "lunge" },
  { pattern: /deadlift|румын|rdl|тяга.*штанг/i, key: "hinge" },
  { pattern: /bench|жим.*лёж|жим.*леж|incline|decline/i, key: "press" },
  { pattern: /row|тяга|гребл|pulldown|блок/i, key: "row" },
  { pattern: /curl|сгибан|бицепс|hammer|молот/i, key: "curl" },
  { pattern: /fly|развод|crossover|кросс/i, key: "fly" },
  { pattern: /triceps|трицепс|skull|француз/i, key: "triceps" },
  { pattern: /shoulder|плеч|lateral|мах|жим.*сид/i, key: "press" },
  { pattern: /crunch|пресс|v.?up|bicycle|скруч|boat|лодоч/i, key: "core" },
  { pattern: /burpee|берпи|mountain|скалолаз|jump/i, key: "cardio" },
  { pattern: /bridge|мост|superman|супермен|ягодич|glute/i, key: "bridge" },
  { pattern: /calf|икрон|носк/i, key: "calf" },
  { pattern: /extension|разгибан.*ног|сгибание ног/i, key: "squat" },
];

export function resolveMovementKey(name: string): MovementKey {
  for (const { pattern, key } of NAME_TO_MOVEMENT) {
    if (pattern.test(name)) {
      return key;
    }
  }
  return "default";
}

export function resolveVisualUrl(name: string, gender: Gender | null | undefined): string {
  const movement = resolveMovementKey(name);
  if (gender === "female") {
    return FEMALE[movement];
  }
  return WGER[movement];
}

/** Per-exercise override (ru/en names) with gender variants. */
const EXACT: Record<string, { male: string; female: string }> = {
  [normalizeExerciseName("Планка")]: {
    male: WGER.plank,
    female: FEMALE.plank,
  },
  [normalizeExerciseName("Plank hold")]: {
    male: WGER.plank,
    female: FEMALE.plank,
  },
  [normalizeExerciseName("Жим штанги лёжа")]: {
    male: WGER.press,
    female: FEMALE.press,
  },
  [normalizeExerciseName("Barbell bench press")]: {
    male: WGER.press,
    female: FEMALE.press,
  },
};

export function resolveExerciseVisualUrl(
  name: string,
  gender: Gender | null | undefined,
): string {
  const key = normalizeExerciseName(name);
  const exact = EXACT[key];
  if (exact) {
    return gender === "female" ? exact.female : exact.male;
  }
  return resolveVisualUrl(name, gender);
}

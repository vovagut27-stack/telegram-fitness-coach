import type { Gender } from "../types/profile.js";
import { normalizeExerciseName } from "./exercise-image-catalog.js";

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
  | "shoulder"
  | "default";

/** wger — разные иллюстрации по типу движения (муж / нейтральный). */
const WGER: Record<MovementKey, string> = {
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
  shoulder: "https://wger.de/media/exercise-images/119/Shoulder-press-1.png",
  default: "https://wger.de/media/exercise-images/131/Squats-2.png",
};

/** Pexels — светлый фон, разные кадры по движению. */
const FEMALE: Record<MovementKey, string> = {
  push: "https://images.pexels.com/photos/4064432/pexels-photo-4064432.jpeg?auto=compress&cs=tinysrgb&w=720",
  pull: "https://images.pexels.com/photos/4753873/pexels-photo-4753873.jpeg?auto=compress&cs=tinysrgb&w=720",
  squat: "https://images.pexels.com/photos/6550858/pexels-photo-6550858.jpeg?auto=compress&cs=tinysrgb&w=720",
  lunge: "https://images.pexels.com/photos/3775164/pexels-photo-3775164.jpeg?auto=compress&cs=tinysrgb&w=720",
  hinge: "https://images.pexels.com/photos/6389508/pexels-photo-6389508.jpeg?auto=compress&cs=tinysrgb&w=720",
  plank: "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=720",
  core: "https://images.pexels.com/photos/3207833/pexels-photo-3207833.jpeg?auto=compress&cs=tinysrgb&w=720",
  curl: "https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=720",
  row: "https://images.pexels.com/photos/4753865/pexels-photo-4753865.jpeg?auto=compress&cs=tinysrgb&w=720",
  press: "https://images.pexels.com/photos/17840/pexels-photo-17840.jpeg?auto=compress&cs=tinysrgb&w=720",
  fly: "https://images.pexels.com/photos/2072941/pexels-photo-2072941.jpeg?auto=compress&cs=tinysrgb&w=720",
  triceps: "https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&cs=tinysrgb&w=720",
  calf: "https://images.pexels.com/photos/6550971/pexels-photo-6550971.jpeg?auto=compress&cs=tinysrgb&w=720",
  cardio: "https://images.pexels.com/photos/3823037/pexels-photo-3823037.jpeg?auto=compress&cs=tinysrgb&w=720",
  bridge: "https://images.pexels.com/photos/6456319/pexels-photo-6456319.jpeg?auto=compress&cs=tinysrgb&w=720",
  shoulder: "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=720",
  default: "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=720",
};

/** Запасные Unsplash — по движению, если wger не грузится в WebView. */
const FALLBACK_MALE: Record<MovementKey, string> = {
  push: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  pull: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  squat: "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  lunge: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80",
  hinge: "https://images.unsplash.com/photo-1517960413843-0aee8e012128?w=640&q=80",
  plank: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  core: "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  curl: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=640&q=80",
  row: "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=640&q=80",
  press: "https://images.unsplash.com/photo-1526506118085-60ce8714f8b5?w=640&q=80",
  fly: "https://images.unsplash.com/photo-1526506118085-60ce8714f8b5?w=640&q=80",
  triceps: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80",
  calf: "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  cardio: "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  bridge: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80",
  shoulder: "https://images.unsplash.com/photo-1583500178690-f7d403a27cde?w=640&q=80",
  default: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80",
};

const FALLBACK_FEMALE: Record<MovementKey, string> = {
  ...FALLBACK_MALE,
  press: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=640&q=80",
  row: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=640&q=80",
};

const NAME_TO_MOVEMENT: Array<{ pattern: RegExp; key: MovementKey }> = [
  { pattern: /push.?up|отжим|обратн.*отжим/i, key: "push" },
  { pattern: /dip|брусь/i, key: "triceps" },
  { pattern: /pull.?up|подтяг|chin/i, key: "pull" },
  { pattern: /plank|планк/i, key: "plank" },
  { pattern: /squat|присед|жим ног|leg press|разгибание ног|leg extension|сгибание ног|leg curl/i, key: "squat" },
  { pattern: /lunge|выпад|пистолет|split/i, key: "lunge" },
  { pattern: /deadlift|румын|rdl|hip thrust|мост/i, key: "hinge" },
  { pattern: /fly|развод|crossover|кросс/i, key: "fly" },
  { pattern: /curl|сгибан|бицепс|hammer|молот/i, key: "curl" },
  { pattern: /triceps|трицепс|skull|француз|разгибание на блоке/i, key: "triceps" },
  { pattern: /row|тяга|гребл|pulldown|горизонтальн|гравитрон/i, key: "row" },
  { pattern: /мах|lateral|rear delt|наклоне/i, key: "shoulder" },
  { pattern: /bench|жим.*лёж|жим.*леж/i, key: "press" },
  { pattern: /жим.*гантел|incline|decline|наклонн|жим.*сид|shoulder press|seated.*press/i, key: "press" },
  { pattern: /crunch|пресс|v.?up|bicycle|скруч|boat|лодоч/i, key: "core" },
  { pattern: /burpee|берпи|mountain|скалолаз|jump/i, key: "cardio" },
  { pattern: /bridge|супермен|ягодич|glute/i, key: "bridge" },
  { pattern: /calf|икрон|носк/i, key: "calf" },
];

export function resolveMovementKey(name: string, equipment?: string): MovementKey {
  const n = name.toLowerCase();
  for (const { pattern, key } of NAME_TO_MOVEMENT) {
    if (pattern.test(n)) {
      return key;
    }
  }
  const eq = (equipment ?? "").toLowerCase();
  if (eq === "barbell") {
    return /тяга|row/i.test(n) ? "row" : /присед|squat/i.test(n) ? "squat" : "press";
  }
  if (eq === "cable") {
    return /cross|кросс|fly|развод/i.test(n) ? "fly" : /трицепс|triceps/i.test(n) ? "triceps" : "row";
  }
  return "default";
}

function pickVisual(movement: MovementKey, gender: Gender | null | undefined): string {
  if (gender === "female") {
    return FEMALE[movement] ?? FEMALE.default;
  }
  return WGER[movement] ?? WGER.default;
}

const EXACT_WGER: Record<string, MovementKey> = {
  [normalizeExerciseName("Жим штанги лёжа")]: "press",
  [normalizeExerciseName("Barbell bench press")]: "press",
  [normalizeExerciseName("Жим гантелей на наклонной")]: "press",
  [normalizeExerciseName("Incline dumbbell press")]: "press",
  [normalizeExerciseName("Разводка гантелей")]: "fly",
  [normalizeExerciseName("Dumbbell flyes")]: "fly",
  [normalizeExerciseName("Кроссовер / блок")]: "fly",
  [normalizeExerciseName("Cable crossover")]: "fly",
  [normalizeExerciseName("Разгибание на блоке (трицепс)")]: "triceps",
  [normalizeExerciseName("Cable triceps pushdown")]: "triceps",
  [normalizeExerciseName("Подтягивания / гравитрон")]: "pull",
  [normalizeExerciseName("Pull-ups / assisted")]: "pull",
  [normalizeExerciseName("Тяга верхнего блока")]: "row",
  [normalizeExerciseName("Lat pulldown")]: "row",
  [normalizeExerciseName("Тяга гантели в наклоне")]: "row",
  [normalizeExerciseName("Single-arm dumbbell row")]: "row",
  [normalizeExerciseName("Тяга горизонтальная")]: "row",
  [normalizeExerciseName("Seated cable row")]: "row",
  [normalizeExerciseName("Сгибание штанги")]: "curl",
  [normalizeExerciseName("Barbell curl")]: "curl",
  [normalizeExerciseName("Присед со штангой")]: "squat",
  [normalizeExerciseName("Barbell back squat")]: "squat",
  [normalizeExerciseName("Жим ногами")]: "squat",
  [normalizeExerciseName("Leg press")]: "squat",
  [normalizeExerciseName("Румынская тяга")]: "hinge",
  [normalizeExerciseName("Romanian deadlift")]: "hinge",
  [normalizeExerciseName("Разгибание ног")]: "squat",
  [normalizeExerciseName("Leg extension")]: "squat",
  [normalizeExerciseName("Сгибание ног")]: "squat",
  [normalizeExerciseName("Leg curl")]: "squat",
  [normalizeExerciseName("Подъём на носки стоя")]: "calf",
  [normalizeExerciseName("Standing calf raise")]: "calf",
  [normalizeExerciseName("Жим гантелей сидя")]: "shoulder",
  [normalizeExerciseName("Seated dumbbell press")]: "shoulder",
  [normalizeExerciseName("Махи в стороны")]: "shoulder",
  [normalizeExerciseName("Lateral raises")]: "shoulder",
  [normalizeExerciseName("Махи в наклоне")]: "shoulder",
  [normalizeExerciseName("Rear delt fly")]: "shoulder",
  [normalizeExerciseName("Французский жим")]: "triceps",
  [normalizeExerciseName("Skull crushers")]: "triceps",
  [normalizeExerciseName("Молотковые сгибания")]: "curl",
  [normalizeExerciseName("Hammer curls")]: "curl",
  [normalizeExerciseName("Планка")]: "plank",
  [normalizeExerciseName("Plank hold")]: "plank",
  [normalizeExerciseName("Отжимания от пола")]: "push",
  [normalizeExerciseName("Standard push-ups")]: "push",
};

export function resolveMovementFallbackUrl(
  name: string,
  gender?: Gender | null | undefined,
  equipment?: string,
): string {
  const key =
    EXACT_WGER[normalizeExerciseName(name)] ?? resolveMovementKey(name, equipment);
  const table = gender === "female" ? FALLBACK_FEMALE : FALLBACK_MALE;
  return table[key] ?? table.default;
}

export function resolveExerciseVisualUrl(
  name: string,
  gender: Gender | null | undefined,
  equipment?: string,
): string {
  const movement =
    EXACT_WGER[normalizeExerciseName(name)] ?? resolveMovementKey(name, equipment);
  return pickVisual(movement, gender);
}

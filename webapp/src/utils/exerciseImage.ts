import type { Gender, WorkoutExercise } from "../types";
import { lookupExercisePhoto } from "./exercisePhotoCatalog";

type MovementKey =
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
  { pattern: /push.?up|отжим|обратн.*отжим|pike|стуль|chair/i, key: "push" },
  { pattern: /dip|брусь/i, key: "triceps" },
  { pattern: /pull.?up|подтяг|chin|гравитрон|австралийск|inverted/i, key: "pull" },
  { pattern: /plank|планк/i, key: "plank" },
  { pattern: /squat|присед|жим ног|leg press|разгибание ног|leg extension|сгибание ног|leg curl/i, key: "squat" },
  { pattern: /lunge|выпад|пистолет|split/i, key: "lunge" },
  { pattern: /deadlift|румын|rdl|hip thrust|мост/i, key: "hinge" },
  { pattern: /fly|развод|crossover|кросс|снежинк/i, key: "fly" },
  { pattern: /curl|сгибан|бицепс|hammer|молот|полотенц/i, key: "curl" },
  { pattern: /triceps|трицепс|skull|француз/i, key: "triceps" },
  { pattern: /row|тяга|pulldown|горизонтальн|гребл|пуловер/i, key: "row" },
  { pattern: /мах|lateral|rear delt|наклоне|подъём.*рук/i, key: "shoulder" },
  { pattern: /bench|жим.*лёж|жим.*леж|жим.*гантел|incline|наклонн|жим.*сид/i, key: "press" },
  { pattern: /crunch|скруч|пресс|v.?up|bicycle|лодоч|bird-dog|птиц/i, key: "core" },
  { pattern: /burpee|берпи|mountain|скалолаз/i, key: "cardio" },
  { pattern: /bridge|супермен|ягодич|glute/i, key: "bridge" },
  { pattern: /calf|икрон|носк/i, key: "calf" },
];

function resolveMovementKey(name: string, equipment?: string): MovementKey {
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

function movementFallback(gender: Gender | null | undefined, key: MovementKey): string {
  const table = gender === "female" ? FALLBACK_FEMALE : FALLBACK_MALE;
  return table[key] ?? table.default;
}

/** Ordered URLs to try (reliable sources first). */
export function exerciseImageCandidates(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): string[] {
  const key = resolveMovementKey(exercise.name, exercise.equipment);
  const urls: string[] = [];
  const add = (url?: string): void => {
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  };
  add(lookupExercisePhoto(exercise.name));
  add(exercise.demoUrl);
  add(exercise.imageFallback);
  add(movementFallback(gender, key));
  add(FALLBACK_MALE.default);
  return urls;
}

export function resolveExerciseImageSrc(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): string {
  return exerciseImageCandidates(exercise, gender)[0] ?? FALLBACK_MALE.default;
}

export function resolveExerciseImageFallback(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): string {
  const candidates = exerciseImageCandidates(exercise, gender);
  return candidates[1] ?? candidates[0] ?? FALLBACK_MALE.default;
}

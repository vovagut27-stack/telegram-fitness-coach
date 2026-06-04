import type { Gender, WorkoutExercise } from "../types";
import { lookupExercisePhoto } from "./exercisePhotoCatalog";
import {
  isLocalExerciseIllustration,
  resolveLocalExerciseAsset,
} from "./exerciseIllustration";

type MovementKey =
  | "push"
  | "pull"
  | "squat"
  | "lunge"
  | "hinge"
  | "plank"
  | "sidePlank"
  | "core"
  | "curl"
  | "row"
  | "press"
  | "fly"
  | "triceps"
  | "calf"
  | "cardio"
  | "burpee"
  | "highKnees"
  | "bridge"
  | "shoulder"
  | "default";

const FEMALE_PHOTO: Record<MovementKey, string> = {
  push: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=720&q=80&auto=format&fit=crop",
  pull: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=720&q=80&auto=format&fit=crop",
  squat: "https://images.unsplash.com/photo-1649887974297-4be052375a67?w=720&q=80&auto=format&fit=crop",
  lunge: "https://images.unsplash.com/photo-1609899517237-77d357b047cf?w=720&q=80&auto=format&fit=crop",
  hinge: "https://images.unsplash.com/photo-1517960413843-0aee8e012128?w=720&q=80",
  plank: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=720&q=80",
  sidePlank: "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=720&q=80&auto=format&fit=crop",
  core: "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=720&q=80",
  curl: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=720&q=80",
  row: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=720&q=80&auto=format&fit=crop",
  press: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=720&q=80&auto=format&fit=crop",
  fly: "https://images.unsplash.com/photo-1526506118085-60ce8714f8b5?w=720&q=80",
  triceps: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=720&q=80&auto=format&fit=crop",
  calf: "https://images.unsplash.com/photo-1649887974297-4be052375a67?w=720&q=80&auto=format&fit=crop",
  cardio: "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=720&q=80",
  burpee: "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=720&q=80&auto=format&fit=crop",
  highKnees: "https://images.unsplash.com/photo-1486218119243-138835b8b8038?w=720&q=80&auto=format&fit=crop",
  bridge: "https://images.unsplash.com/photo-1599904490399-5514912ea3a5?w=720&q=80&auto=format&fit=crop",
  shoulder: "https://images.unsplash.com/photo-1583500178690-f7d403a27cde?w=720&q=80",
  default: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=720&q=80",
};

const MALE_PHOTO: Record<MovementKey, string> = {
  push: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=720&q=80",
  pull: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=720&q=80",
  squat: "https://images.unsplash.com/photo-1649887974297-4be052375a67?w=720&q=80&auto=format&fit=crop",
  lunge: "https://images.unsplash.com/photo-1576678927481-e4c07d32309a?w=720&q=80&auto=format&fit=crop",
  hinge: "https://images.unsplash.com/photo-1517960413843-0aee8e012128?w=720&q=80",
  plank: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=720&q=80",
  sidePlank: "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=720&q=80&auto=format&fit=crop",
  core: "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=720&q=80",
  curl: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=720&q=80",
  row: "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=720&q=80",
  press: "https://images.unsplash.com/photo-1526506118085-60ce8714f8b5?w=720&q=80",
  fly: "https://images.unsplash.com/photo-1526506118085-60ce8714f8b5?w=720&q=80",
  triceps: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=720&q=80",
  calf: "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=720&q=80",
  cardio: "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=720&q=80",
  burpee: "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=720&q=80&auto=format&fit=crop",
  highKnees: "https://images.unsplash.com/photo-1486218119243-138835b8b8038?w=720&q=80&auto=format&fit=crop",
  bridge: "https://images.unsplash.com/photo-1599904490399-5514912ea3a5?w=720&q=80&auto=format&fit=crop",
  shoulder: "https://images.unsplash.com/photo-1583500178690-f7d403a27cde?w=720&q=80",
  default: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=720&q=80",
};

const EXACT_MOVEMENT: Record<string, MovementKey> = {
  "бёрпи": "burpee",
  burpees: "burpee",
  "бег с высоким подниманием колена": "highKnees",
  "high knees": "highKnees",
  "боковая планка": "sidePlank",
  "side plank": "sidePlank",
  "ягодичный мост": "bridge",
  "glute bridge": "bridge",
  "выпады назад": "lunge",
  "reverse lunges": "lunge",
  "выпады вперёд": "lunge",
  "forward lunges": "lunge",
  приседания: "squat",
  "bodyweight squats": "squat",
};

const NAME_TO_MOVEMENT: Array<{ pattern: RegExp; key: MovementKey }> = [
  { pattern: /push.?up|отжим|обратн.*отжим|pike|стуль|chair/i, key: "push" },
  { pattern: /dip|брусь/i, key: "triceps" },
  { pattern: /pull.?up|подтяг|chin|гравитрон|австралийск|inverted/i, key: "pull" },
  { pattern: /side.*plank|боков.*планк/i, key: "sidePlank" },
  { pattern: /plank|планк/i, key: "plank" },
  { pattern: /squat|присед|жим ног|leg press|разгибание ног|leg extension|сгибание ног|leg curl/i, key: "squat" },
  { pattern: /выпад|lunge/i, key: "lunge" },
  { pattern: /deadlift|румын|rdl|hip thrust/i, key: "hinge" },
  { pattern: /bridge|супермен|ягодич|glute/i, key: "bridge" },
  { pattern: /fly|развод|crossover|кросс|снежинк/i, key: "fly" },
  { pattern: /curl|сгибан|бицепс|hammer|молот|полотенц/i, key: "curl" },
  { pattern: /triceps|трицепс|skull|француз/i, key: "triceps" },
  { pattern: /row|тяга|pulldown|горизонтальн|гребл|пуловер/i, key: "row" },
  { pattern: /мах|lateral|rear delt|наклоне|подъём.*рук/i, key: "shoulder" },
  { pattern: /bench|жим.*лёж|жим.*леж|жим.*гантел|incline|decline|наклонн|жим.*сид/i, key: "press" },
  { pattern: /crunch|скруч|пресс|v.?up|bicycle|лодоч|bird/i, key: "core" },
  { pattern: /high knee|высок.*колен|бег с высоким/i, key: "highKnees" },
  { pattern: /burpee|бёрпи|берпи/i, key: "burpee" },
  { pattern: /mountain|скалолаз|jumping jack|прыжк.*разведен/i, key: "cardio" },
  { pattern: /jump|прыжк/i, key: "cardio" },
  { pattern: /calf|икрон|носк/i, key: "calf" },
];

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveMovementKey(name: string, equipment?: string): MovementKey {
  const exact = EXACT_MOVEMENT[normalizeName(name)];
  if (exact) {
    return exact;
  }
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

function movementPhoto(gender: Gender | null | undefined, key: MovementKey): string {
  const table = gender === "female" ? FEMALE_PHOTO : MALE_PHOTO;
  return table[key] ?? table.default;
}

/** Фото с людьми — первым делом; SVG только в конце цепочки. */
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

  const demo = exercise.demoUrl;
  if (demo && !isLocalExerciseIllustration(demo)) {
    add(demo);
  }

  add(movementPhoto(gender, key));

  if (demo && isLocalExerciseIllustration(demo)) {
    add(resolveLocalExerciseAsset(demo));
  }

  const fallback = exercise.imageFallback;
  if (fallback && isLocalExerciseIllustration(fallback)) {
    add(resolveLocalExerciseAsset(fallback));
  } else {
    add(fallback);
  }

  add(MALE_PHOTO.default);
  return urls;
}

export function resolveExerciseImageSrc(
  exercise: WorkoutExercise,
  gender?: Gender | null,
): string {
  return exerciseImageCandidates(exercise, gender)[0] ?? MALE_PHOTO.default;
}

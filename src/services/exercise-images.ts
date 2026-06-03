import type { WorkoutExercise } from "../types/workout.js";

/** Stable royalty-free fitness photos (Unsplash CDN). */
const IMAGES = {
  default: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80",
  push: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  pull: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  legs: "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  core: "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  cardio: "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  shoulders: "https://images.unsplash.com/photo-1583500178690-f7d403a27cde?w=640&q=80",
  bench: "https://images.unsplash.com/photo-1526506118085-60ce8714f8b5?w=640&q=80",
  curl: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=640&q=80",
  row: "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=640&q=80",
  lunge: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80",
  plank: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  deadlift: "https://images.unsplash.com/photo-1517960413843-0aee8e012128?w=640&q=80",
} as const;

const RULES: Array<{ pattern: RegExp; url: string }> = [
  { pattern: /push.?up|отжим/i, url: IMAGES.push },
  { pattern: /pull.?up|подтяг|chin.?up/i, url: IMAGES.pull },
  { pattern: /plank|планк/i, url: IMAGES.plank },
  { pattern: /squat|присед|выпад|lunge|пистолет|split/i, url: IMAGES.lunge },
  { pattern: /deadlift|румын|rdl|тяга.*штанг/i, url: IMAGES.deadlift },
  { pattern: /bench|жим.*лёж|жим.*леж|decline|incline/i, url: IMAGES.bench },
  { pattern: /row|тяга|гребл/i, url: IMAGES.row },
  { pattern: /curl|сгибан|бицепс|hammer|молот/i, url: IMAGES.curl },
  { pattern: /fly|развод|crossover|кросс/i, url: IMAGES.shoulders },
  { pattern: /press|жим|shoulder|плеч|lateral|мах/i, url: IMAGES.shoulders },
  { pattern: /triceps|трицепс|skull|француз/i, url: IMAGES.push },
  { pattern: /leg|ног|calf|икрон|extension|разгибан.*ног/i, url: IMAGES.legs },
  { pattern: /crunch|пресс|v.?up|bicycle|скруч|boat|лодоч/i, url: IMAGES.core },
  { pattern: /burpee|берпи|mountain|скалолаз|jump/i, url: IMAGES.cardio },
  { pattern: /superman|супермен|bridge|мост/i, url: IMAGES.core },
  { pattern: /dip|обратн.*отжим/i, url: IMAGES.push },
];

export function resolveExerciseImageUrl(name: string, equipment?: string): string {
  const text = `${name} ${equipment ?? ""}`;
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      return rule.url;
    }
  }
  const eq = (equipment ?? "").toLowerCase();
  if (eq.includes("barbell") || eq.includes("dumbbell")) {
    return IMAGES.bench;
  }
  return IMAGES.default;
}

export function enrichExerciseImage(exercise: WorkoutExercise): WorkoutExercise {
  if (exercise.demoUrl?.startsWith("http")) {
    return exercise;
  }
  return {
    ...exercise,
    demoUrl: resolveExerciseImageUrl(exercise.name, exercise.equipment),
  };
}

export function enrichWorkoutExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises.map(enrichExerciseImage);
}

import type { WorkoutExercise } from "../types/workout.js";
import { EXERCISE_PHOTOS, normalizeExerciseName } from "./exercise-image-catalog.js";

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80";

/** Fallback when exact name is missing (ordered: specific → generic). */
const RULES: Array<{ pattern: RegExp; url: string }> = [
  { pattern: /push.?up|отжим/i, url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80" },
  { pattern: /pull.?up|подтяг|chin/i, url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80" },
  { pattern: /plank|планк/i, url: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80" },
  { pattern: /squat|присед|lunge|выпад|пистолет/i, url: "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80" },
  { pattern: /deadlift|румын|rdl/i, url: "https://images.unsplash.com/photo-1517960413843-0aee8e012128?w=640&q=80" },
  { pattern: /bench|жим.*лёж|жим.*леж/i, url: "https://images.unsplash.com/photo-1526506118085-60ce8714f8b5?w=640&q=80" },
  { pattern: /\brow\b|тяга|гребл/i, url: "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=640&q=80" },
  { pattern: /curl|сгибан|бицепс|hammer|молот/i, url: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=640&q=80" },
  { pattern: /fly|развод|crossover|кросс/i, url: "https://images.unsplash.com/photo-1526506118085-60ce8714f8b5?w=640&q=80" },
  { pattern: /shoulder|плеч|lateral|мах/i, url: "https://images.unsplash.com/photo-1583500178690-f7d403a27cde?w=640&q=80" },
  { pattern: /triceps|трицепс|skull|француз|dip/i, url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80" },
  { pattern: /leg press|жим ног|extension|разгибан.*ног|calf|икрон/i, url: "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80" },
  { pattern: /crunch|пресс|v.?up|bicycle|скруч|boat|лодоч/i, url: "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80" },
  { pattern: /burpee|берпи|mountain|скалолаз|jump/i, url: "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80" },
  { pattern: /bridge|мост|superman|супермен/i, url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80" },
];

export function resolveExerciseImageUrl(name: string, _equipment?: string): string {
  const key = normalizeExerciseName(name);
  const exact = EXERCISE_PHOTOS[key];
  if (exact) {
    return exact;
  }
  for (const rule of RULES) {
    if (rule.pattern.test(name)) {
      return rule.url;
    }
  }
  return DEFAULT_IMG;
}

export function enrichExerciseImage(exercise: WorkoutExercise): WorkoutExercise {
  return {
    ...exercise,
    demoUrl: resolveExerciseImageUrl(exercise.name, exercise.equipment),
  };
}

export function enrichWorkoutExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises.map(enrichExerciseImage);
}

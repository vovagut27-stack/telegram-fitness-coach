import type { FitnessLevel, WorkoutExercise } from "../types";

function parseRepsLow(reps: string): number {
  const m = reps.match(/(\d+)/);
  return m ? Number(m[1]) : 10;
}

export function scoreExerciseDifficulty(exercise: WorkoutExercise): number {
  const name = exercise.name.toLowerCase();
  const eq = exercise.equipment.toLowerCase();
  const repsLow = parseRepsLow(exercise.reps);

  let score = 2;

  if (/присед|squat|жим ног|leg press|пистолет|pistol/i.test(name)) {
    score = 5;
  } else if (/deadlift|румын|rdl|тяга.*штанг|hip thrust/i.test(name)) {
    score = 5;
  } else if (/bench|жим.*лёж|жим.*леж|жим штанг/i.test(name)) {
    score = 5;
  } else if (/pull.?up|подтяг|chin.?up|гравитрон/i.test(name)) {
    score = 4;
  } else if (/barbell|штанг/i.test(name) || eq === "barbell") {
    score = 4;
  } else if (/leg press|жим ног/i.test(name)) {
    score = 4;
  } else if (
    /row|тяга|press|жим|lunge|выпад|burpee|берпи|dip|отжим/i.test(name) &&
    (eq === "dumbbell" || eq === "cable" || eq === "machine")
  ) {
    score = 3;
  } else if (/plank|планк|crunch|скруч|raise|мах/i.test(name)) {
    score = 1;
  } else if (eq === "none" || eq === "bodyweight" || eq === "chair") {
    score = /отжим|push|burpee|подтяг|pull/i.test(name) ? 2 : 1;
  } else if (eq === "dumbbell" || eq === "cable") {
    score = 3;
  }

  if (repsLow <= 6) {
    score = Math.min(5, score + 1);
  } else if (repsLow <= 8) {
    score = Math.min(5, score + 1);
  }

  if (exercise.sets >= 4 && score >= 3) {
    score = Math.min(5, score + 1);
  }

  return Math.max(1, Math.min(5, score));
}

const TIER_MULTIPLIER: Record<number, number> = {
  1: 1.2,
  2: 1.45,
  3: 1.7,
  4: 2.0,
  5: 2.35,
};

const PLAN_REST_BONUS: Record<FitnessLevel, number> = {
  beginner: 0,
  intermediate: 8,
  advanced: 15,
};

/** Совпадает с бэкендом: отдых дольше для тяжёлых упражнений. */
export function effectiveRestSeconds(
  exercise: WorkoutExercise,
  planLevel: FitnessLevel = "beginner",
): number {
  const tier = scoreExerciseDifficulty(exercise);
  const mult = TIER_MULTIPLIER[tier] ?? 1.5;
  const base = exercise.restSeconds || 60;
  const bonus = PLAN_REST_BONUS[planLevel] ?? 0;
  return Math.min(240, Math.max(50, Math.round(base * mult + bonus)));
}

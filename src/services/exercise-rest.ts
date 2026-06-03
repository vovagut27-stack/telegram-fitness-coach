import type { FitnessLevel, WorkoutExercise } from "../types/workout.js";

/** 1 = лёгкое, 5 = тяжёлое базовое / силовое */
export function scoreExerciseDifficulty(exercise: WorkoutExercise): number {
  const name = exercise.name.toLowerCase();
  const eq = exercise.equipment.toLowerCase();
  const repsLow = parseRepsLow(exercise.reps);

  let score = 2;

  if (/присед|squat|жим ног|leg press|пистолет|pistol/i.test(name)) {
    score = 5;
  } else if (/deadlift|румын|rdl|тяга.*штанг|hip thrust|мост.*штанг/i.test(name)) {
    score = 5;
  } else if (/bench|жим.*лёж|жим.*леж|жим штанг/i.test(name)) {
    score = 5;
  } else if (/pull.?up|подтяг|chin.?up|гравитрон/i.test(name)) {
    score = 4;
  } else if (/barbell|штанг/i.test(name) || eq === "barbell") {
    score = 4;
  } else if (/leg press|жим ног|hack|гакк/i.test(name)) {
    score = 4;
  } else if (
    /row|тяга|press|жим|lunge|выпад|burpee|берпи|dip|отжим/i.test(name) &&
    (eq === "dumbbell" || eq === "cable" || eq === "machine")
  ) {
    score = 3;
  } else if (/plank|планк|crunch|скруч|stretch|растяж|raise|мах/i.test(name)) {
    score = 1;
  } else if (eq === "none" || eq === "bodyweight" || eq === "chair") {
    score = /отжим|push|burpee|подтяг|pull/i.test(name) ? 2 : 1;
  } else if (eq === "dumbbell" || eq === "cable") {
    score = 3;
  }

  if (repsLow <= 6) {
    score = Math.min(5, score + 1);
  } else if (repsLow <= 8) {
    score = Math.min(5, score + 0.5);
  }

  if (exercise.sets >= 4 && score >= 3) {
    score = Math.min(5, score + 0.5);
  }

  return Math.max(1, Math.min(5, Math.round(score)));
}

function parseRepsLow(reps: string): number {
  const m = reps.match(/(\d+)/);
  return m ? Number(m[1]) : 10;
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

/** Увеличивает restSeconds относительно сложности упражнения. */
export function applyExerciseRest(
  exercise: WorkoutExercise,
  planLevel: FitnessLevel = "beginner",
): WorkoutExercise {
  const tier = scoreExerciseDifficulty(exercise);
  const mult = TIER_MULTIPLIER[tier] ?? 1.5;
  const base = exercise.restSeconds || 60;
  const bonus = PLAN_REST_BONUS[planLevel] ?? 0;
  const scaled = Math.round(base * mult + bonus);
  const restSeconds = Math.min(240, Math.max(50, scaled));

  return { ...exercise, restSeconds };
}

export function applyWorkoutRest(
  exercises: WorkoutExercise[],
  planLevel: FitnessLevel = "beginner",
): WorkoutExercise[] {
  return exercises.map((ex) => applyExerciseRest(ex, planLevel));
}

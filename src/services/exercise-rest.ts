import type { FitnessLevel, WorkoutExercise } from "../types/workout.js";

/** 1 = лёгкое, 5 = тяжёлое базовое */
export function scoreExerciseDifficulty(exercise: WorkoutExercise): number {
  const name = exercise.name.toLowerCase();
  const eq = exercise.equipment.toLowerCase();
  const repsLow = parseRepsLow(exercise.reps);

  let score = 2;

  if (/присед|squat|жим ног|leg press|пистолет|pistol/i.test(name)) {
    score = 5;
  } else if (/deadlift|румын|rdl|hip thrust/i.test(name)) {
    score = 5;
  } else if (/bench|жим.*лёж|жим.*леж|жим штанг/i.test(name)) {
    score = 5;
  } else if (/pull.?up|подтяг|chin.?up|гравитрон/i.test(name)) {
    score = 4;
  } else if (/barbell|штанг/i.test(name) || eq === "barbell") {
    score = 4;
  } else if (
    /row|тяга|гребл|pulldown|горизонтальн/i.test(name) &&
    (eq === "dumbbell" || eq === "cable" || eq === "machine")
  ) {
    score = 3;
  } else if (/plank|планк|crunch|скруч|raise|мах/i.test(name)) {
    score = 1;
  } else if (eq === "none" || eq === "bodyweight" || eq === "chair") {
    score = /отжим|push|burpee|подтяг|pull/i.test(name) ? 2 : 1;
  } else if (/fly|развод|crossover|кросс/i.test(name)) {
    score = 2;
  } else if (/curl|сгибан|трицепс|triceps|skull|француз/i.test(name)) {
    score = 2;
  } else if (eq === "dumbbell" || eq === "cable") {
    score = 3;
  }

  if (repsLow <= 6) {
    score = Math.min(5, score + 1);
  }

  return Math.max(1, Math.min(5, score));
}

function parseRepsLow(reps: string): number {
  const m = reps.match(/(\d+)/);
  return m ? Number(m[1]) : 10;
}

/** Умеренная надбавка к отдыху из шаблона (без раздувания до 3–4 мин). */
const TIER_EXTRA_SEC: Record<number, number> = {
  1: 0,
  2: 8,
  3: 15,
  4: 25,
  5: 35,
};

const PLAN_REST_BONUS: Record<FitnessLevel, number> = {
  beginner: 0,
  intermediate: 3,
  advanced: 6,
};

export function applyExerciseRest(
  exercise: WorkoutExercise,
  planLevel: FitnessLevel = "beginner",
): WorkoutExercise {
  const tier = scoreExerciseDifficulty(exercise);
  const base = exercise.restSeconds || 60;
  const extra = TIER_EXTRA_SEC[tier] ?? 15;
  const bonus = PLAN_REST_BONUS[planLevel] ?? 0;
  const restSeconds = Math.min(120, Math.max(35, base + extra + bonus));

  return { ...exercise, restSeconds };
}

export function applyWorkoutRest(
  exercises: WorkoutExercise[],
  planLevel: FitnessLevel = "beginner",
): WorkoutExercise[] {
  return exercises.map((ex) => applyExerciseRest(ex, planLevel));
}

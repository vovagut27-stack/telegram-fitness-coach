import {
  clearExerciseLogs,
  getWorkoutByDate,
  markWorkoutCompleted,
  saveExerciseLogsBatch,
  type ExerciseLogRow,
} from "../database/workouts-repo.js";
import { getOrCreateGymWorkoutForDate, getOrCreateWorkoutForDate } from "./workout-service.js";
import type { WorkoutPlan } from "../types/workout.js";

export interface CompleteWorkoutInput {
  telegramId: number;
  workoutDate: string;
  completionNotes: string;
  exercises: Array<{
    exerciseName: string;
    setsCompleted: number;
    repsCompleted: number[];
    weightUsed?: number;
    durationSeconds?: number;
  }>;
  gymMode?: boolean;
}

function logsFromPlan(plan: WorkoutPlan): ExerciseLogRow[] {
  return plan.exercises.map((ex) => ({
    exerciseName: ex.name,
    setsCompleted: ex.sets,
    repsCompleted: Array.from({ length: ex.sets }, () => Number(ex.reps.split("-")[0]) || 10),
    weightUsed: null,
    durationSeconds: ex.sets * 45,
  }));
}

function normalizeLogs(
  exercises: CompleteWorkoutInput["exercises"],
  plan: WorkoutPlan,
): ExerciseLogRow[] {
  const incoming = exercises
    .filter((e) => e.exerciseName?.trim())
    .map((e) => ({
      exerciseName: e.exerciseName.trim(),
      setsCompleted: e.setsCompleted,
      repsCompleted: e.repsCompleted ?? [],
      weightUsed: e.weightUsed ?? null,
      durationSeconds: e.durationSeconds ?? null,
    }));

  if (incoming.length > 0) {
    return incoming;
  }
  return logsFromPlan(plan);
}

/** Завершает тренировку и пишет exercise_logs для вкладки «Результаты». */
export async function completeWorkoutWithLogs(
  input: CompleteWorkoutInput,
): Promise<{ date: string; exerciseCount: number }> {
  const { telegramId, workoutDate, completionNotes, exercises, gymMode } = input;

  let row = await getWorkoutByDate(telegramId, workoutDate);
  if (!row) {
    if (gymMode) {
      await getOrCreateGymWorkoutForDate(telegramId, workoutDate);
    } else {
      await getOrCreateWorkoutForDate(telegramId, workoutDate);
    }
    row = await getWorkoutByDate(telegramId, workoutDate);
    if (!row) {
      throw new Error("Workout could not be created");
    }
  }

  const logs = normalizeLogs(exercises, row.plan);
  await clearExerciseLogs(row.id);
  await saveExerciseLogsBatch(
    row.id,
    logs.map((entry) => ({
      exerciseName: entry.exerciseName,
      setsCompleted: entry.setsCompleted,
      repsCompleted: entry.repsCompleted,
      weightUsed: entry.weightUsed ?? undefined,
      durationSeconds: entry.durationSeconds ?? undefined,
    })),
  );
  await markWorkoutCompleted(row.id, completionNotes || (gymMode ? "Gym" : "Home"));

  return { date: workoutDate, exerciseCount: logs.length };
}

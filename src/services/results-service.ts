import { addWeightLog, getWeightHistory, type WeightLogEntry } from "../database/weight-repo.js";
import {
  clearExerciseLogs,
  getWorkoutByDate,
  getWorkoutResultsHistory,
  markWorkoutCompleted,
  saveExerciseLog,
  saveWorkoutPlan,
  type ExerciseLogRow,
  type WorkoutResultDay,
} from "../database/workouts-repo.js";
import { getOrCreateWorkoutForDate } from "./workout-service.js";
import { isoDateOnly } from "./schedule-service.js";
import type { WorkoutPlan } from "../types/workout.js";

export interface ResultsComparison {
  completedThisWeek: number;
  completedLastWeek: number;
  totalSetsThisWeek: number;
  totalSetsLastWeek: number;
  weightChangeKg: number | null;
  weightTrend: "down" | "up" | "stable" | null;
  firstWeight: number | null;
  latestWeight: number | null;
}

export async function logUserWeight(
  telegramId: number,
  weightKg: number,
  logDate?: string,
  note?: string,
): Promise<WeightLogEntry[]> {
  const date = logDate ?? isoDateOnly();
  await addWeightLog(telegramId, weightKg, date, note);
  return getWeightHistory(telegramId, 90);
}

export async function getUserWeightHistory(telegramId: number): Promise<{
  entries: WeightLogEntry[];
  comparison: Pick<
    ResultsComparison,
    "weightChangeKg" | "weightTrend" | "firstWeight" | "latestWeight"
  >;
}> {
  const entries = await getWeightHistory(telegramId, 90);
  const sorted = [...entries].sort((a, b) => a.logDate.localeCompare(b.logDate));
  const first = sorted[0]?.weightKg ?? null;
  const latest = sorted[sorted.length - 1]?.weightKg ?? null;
  let weightChangeKg: number | null = null;
  let weightTrend: ResultsComparison["weightTrend"] = null;
  if (first != null && latest != null && sorted.length >= 2) {
    weightChangeKg = Math.round((latest - first) * 10) / 10;
    if (Math.abs(weightChangeKg) < 0.3) {
      weightTrend = "stable";
    } else if (weightChangeKg < 0) {
      weightTrend = "down";
    } else {
      weightTrend = "up";
    }
  }
  return { entries, comparison: { weightChangeKg, weightTrend, firstWeight: first, latestWeight: latest } };
}

export async function listWorkoutResults(
  telegramId: number,
  limitDays = 60,
): Promise<WorkoutResultDay[]> {
  return getWorkoutResultsHistory(telegramId, limitDays);
}

export async function saveManualWorkoutResults(
  telegramId: number,
  workoutDate: string,
  exercises: ExerciseLogRow[],
  completionNotes?: string,
): Promise<WorkoutResultDay> {
  let row = await getWorkoutByDate(telegramId, workoutDate);
  if (!row) {
    const plan = await getOrCreateWorkoutForDate(telegramId, workoutDate);
    const workoutId = await saveWorkoutPlan(telegramId, workoutDate, plan);
    row = { id: workoutId, plan, completed: false };
  }

  await clearExerciseLogs(row.id);
  for (const entry of exercises) {
    if (!entry.exerciseName.trim()) {
      continue;
    }
    await saveExerciseLog({
      workoutId: row.id,
      exerciseName: entry.exerciseName.trim(),
      setsCompleted: entry.setsCompleted,
      repsCompleted: entry.repsCompleted,
      weightUsed: entry.weightUsed ?? undefined,
      durationSeconds: entry.durationSeconds ?? undefined,
    });
  }
  await markWorkoutCompleted(row.id, completionNotes ?? "Manual log");

  const history = await getWorkoutResultsHistory(telegramId, 90);
  return (
    history.find((d) => d.workoutDate === workoutDate) ?? {
      workoutDate,
      completed: true,
      completionNotes: completionNotes ?? null,
      focusTitle: row.plan.splitDay ?? null,
      programType: row.plan.programType === "gym" ? "gym" : "daily",
      exercises,
    }
  );
}

function weekBounds(offsetWeeks: number): { start: string; end: string } {
  const d = new Date();
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday + offsetWeeks * 7);
  const start = isoDateOnly(d);
  d.setDate(d.getDate() + 6);
  const end = isoDateOnly(d);
  return { start, end };
}

export async function getResultsComparison(telegramId: number): Promise<ResultsComparison> {
  const history = await getWorkoutResultsHistory(telegramId, 90);
  const thisW = weekBounds(0);
  const lastW = weekBounds(-1);

  const inRange = (date: string, start: string, end: string) =>
    date >= start && date <= end;

  const thisWeek = history.filter((d) => inRange(d.workoutDate, thisW.start, thisW.end));
  const lastWeek = history.filter((d) => inRange(d.workoutDate, lastW.start, lastW.end));

  const sumSets = (days: WorkoutResultDay[]) =>
    days.reduce(
      (acc, d) => acc + d.exercises.reduce((s, e) => s + e.setsCompleted, 0),
      0,
    );

  const weight = await getUserWeightHistory(telegramId);

  return {
    completedThisWeek: thisWeek.filter((d) => d.completed).length,
    completedLastWeek: lastWeek.filter((d) => d.completed).length,
    totalSetsThisWeek: sumSets(thisWeek),
    totalSetsLastWeek: sumSets(lastWeek),
    weightChangeKg: weight.comparison.weightChangeKg,
    weightTrend: weight.comparison.weightTrend,
    firstWeight: weight.comparison.firstWeight,
    latestWeight: weight.comparison.latestWeight,
  };
}

export async function getPlanForResultsDate(
  telegramId: number,
  workoutDate: string,
): Promise<WorkoutPlan> {
  const existing = await getWorkoutByDate(telegramId, workoutDate);
  if (existing) {
    return existing.plan;
  }
  return getOrCreateWorkoutForDate(telegramId, workoutDate);
}

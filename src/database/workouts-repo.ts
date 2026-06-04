import { db } from "./index.js";
import { WorkoutPlan } from "../types/workout.js";

export async function saveWorkoutPlan(
  telegramId: number,
  workoutDate: string,
  plan: WorkoutPlan,
): Promise<number> {
  const result = await db.query(
    `
      INSERT INTO workouts (telegram_id, workout_date, ai_generated_plan)
      VALUES ($1, $2, $3)
      ON CONFLICT (telegram_id, workout_date)
      DO UPDATE SET ai_generated_plan = EXCLUDED.ai_generated_plan
      RETURNING id
    `,
    [telegramId, workoutDate, plan],
  );
  return result.rows[0].id as number;
}

export async function getWorkoutByDate(
  telegramId: number,
  workoutDate: string,
): Promise<{ id: number; plan: WorkoutPlan; completed: boolean } | null> {
  const result = await db.query(
    `
      SELECT id, ai_generated_plan, completed
      FROM workouts
      WHERE telegram_id = $1 AND workout_date = $2
    `,
    [telegramId, workoutDate],
  );
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  return { id: row.id, plan: row.ai_generated_plan, completed: row.completed };
}

export async function markWorkoutCompleted(
  workoutId: number,
  completionNotes: string,
): Promise<void> {
  await db.query(
    `
      UPDATE workouts
      SET completed = TRUE, completion_notes = $2
      WHERE id = $1
    `,
    [workoutId, completionNotes],
  );
}

export async function saveExerciseLog(input: {
  workoutId: number;
  exerciseName: string;
  setsCompleted: number;
  repsCompleted: number[];
  weightUsed?: number;
  durationSeconds?: number;
}): Promise<void> {
  await db.query(
    `
      INSERT INTO exercise_logs
      (workout_id, exercise_name, sets_completed, reps_completed, weight_used, duration_seconds)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      input.workoutId,
      input.exerciseName,
      input.setsCompleted,
      input.repsCompleted,
      input.weightUsed ?? null,
      input.durationSeconds ?? null,
    ],
  );
}

export async function saveExerciseLogsBatch(
  workoutId: number,
  entries: Array<{
    exerciseName: string;
    setsCompleted: number;
    repsCompleted: number[];
    weightUsed?: number;
    durationSeconds?: number;
  }>,
): Promise<void> {
  if (entries.length === 0) {
    return;
  }
  const values: unknown[] = [workoutId];
  const tuples: string[] = [];
  let i = 2;
  for (const entry of entries) {
    tuples.push(`($1, $${i}, $${i + 1}, $${i + 2}, $${i + 3}, $${i + 4})`);
    values.push(
      entry.exerciseName,
      entry.setsCompleted,
      entry.repsCompleted,
      entry.weightUsed ?? null,
      entry.durationSeconds ?? null,
    );
    i += 5;
  }
  await db.query(
    `
      INSERT INTO exercise_logs
      (workout_id, exercise_name, sets_completed, reps_completed, weight_used, duration_seconds)
      VALUES ${tuples.join(", ")}
    `,
    values,
  );
}

export async function getRecentWorkouts(
  telegramId: number,
  limit: number,
): Promise<WorkoutPlan[]> {
  const result = await db.query(
    `
      SELECT ai_generated_plan
      FROM workouts
      WHERE telegram_id = $1
      ORDER BY workout_date DESC
      LIMIT $2
    `,
    [telegramId, limit],
  );
  return result.rows.map((row) => row.ai_generated_plan as WorkoutPlan);
}

export async function deleteWorkoutByDate(telegramId: number, workoutDate: string): Promise<void> {
  await db.query(
    `
      DELETE FROM workouts
      WHERE telegram_id = $1 AND workout_date = $2
    `,
    [telegramId, workoutDate],
  );
}

export async function countCompletedThisWeek(telegramId: number): Promise<number> {
  const result = await db.query(
    `
      SELECT COUNT(*)::int AS workout_count
      FROM workouts
      WHERE telegram_id = $1
        AND completed = TRUE
        AND workout_date >= date_trunc('week', CURRENT_DATE)::date
    `,
    [telegramId],
  );
  return result.rows[0]?.workout_count ?? 0;
}

export async function getCompletedWorkoutDates(
  telegramId: number,
  limitDays = 120,
): Promise<string[]> {
  const result = await db.query(
    `
      SELECT workout_date::text AS workout_date
      FROM workouts
      WHERE telegram_id = $1::bigint
        AND completed = TRUE
      ORDER BY workout_date DESC
      LIMIT $2
    `,
    [String(telegramId), limitDays],
  );
  return result.rows.map((row) => String(row.workout_date).slice(0, 10));
}

/** Remove cached home plans so the next open regenerates with updated profile. */
export interface ExerciseLogRow {
  exerciseName: string;
  setsCompleted: number;
  repsCompleted: number[];
  weightUsed: number | null;
  durationSeconds: number | null;
}

export interface WorkoutResultDay {
  workoutDate: string;
  completed: boolean;
  completionNotes: string | null;
  focusTitle: string | null;
  programType: "daily" | "gym" | null;
  exercises: ExerciseLogRow[];
}

export async function getExerciseLogsForWorkout(workoutId: number): Promise<ExerciseLogRow[]> {
  const result = await db.query(
    `
      SELECT exercise_name, sets_completed, reps_completed, weight_used, duration_seconds
      FROM exercise_logs
      WHERE workout_id = $1
      ORDER BY id
    `,
    [workoutId],
  );
  return result.rows.map((row) => ({
    exerciseName: String(row.exercise_name),
    setsCompleted: Number(row.sets_completed),
    repsCompleted: (row.reps_completed as number[]) ?? [],
    weightUsed: row.weight_used != null ? Number(row.weight_used) : null,
    durationSeconds: row.duration_seconds != null ? Number(row.duration_seconds) : null,
  }));
}

export async function clearExerciseLogs(workoutId: number): Promise<void> {
  await db.query(`DELETE FROM exercise_logs WHERE workout_id = $1`, [workoutId]);
}

export async function getWorkoutResultsHistory(
  telegramId: number,
  limitDays = 60,
): Promise<WorkoutResultDay[]> {
  const result = await db.query(
    `
      SELECT
        w.id,
        w.workout_date,
        w.completed,
        w.completion_notes,
        w.ai_generated_plan
      FROM workouts w
      WHERE w.telegram_id = $1::bigint
        AND (w.completed = TRUE OR EXISTS (
          SELECT 1 FROM exercise_logs el WHERE el.workout_id = w.id
        ))
      ORDER BY w.workout_date DESC
      LIMIT $2
    `,
    [String(telegramId), limitDays],
  );

  const days: WorkoutResultDay[] = [];
  for (const row of result.rows) {
    const plan = row.ai_generated_plan as WorkoutPlan;
    const logs = await getExerciseLogsForWorkout(Number(row.id));
    days.push({
      workoutDate: String(row.workout_date).slice(0, 10),
      completed: Boolean(row.completed),
      completionNotes: row.completion_notes ? String(row.completion_notes) : null,
      focusTitle: plan?.splitDay ?? plan?.targetMuscles?.join(", ") ?? null,
      programType: plan?.programType === "gym" ? "gym" : "daily",
      exercises: logs,
    });
  }
  return days;
}

export async function deleteIncompleteWorkoutsFrom(
  telegramId: number,
  fromDate: string,
): Promise<void> {
  await db.query(
    `
      DELETE FROM workouts
      WHERE telegram_id = $1
        AND workout_date >= $2::date
        AND completed = FALSE
    `,
    [telegramId, fromDate],
  );
}

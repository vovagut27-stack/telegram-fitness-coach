import { db } from "./index.js";
export async function saveWorkoutPlan(telegramId, workoutDate, plan) {
    const result = await db.query(`
      INSERT INTO workouts (telegram_id, workout_date, ai_generated_plan)
      VALUES ($1, $2, $3)
      ON CONFLICT (telegram_id, workout_date)
      DO UPDATE SET ai_generated_plan = EXCLUDED.ai_generated_plan
      RETURNING id
    `, [telegramId, workoutDate, plan]);
    return result.rows[0].id;
}
export async function getWorkoutByDate(telegramId, workoutDate) {
    const result = await db.query(`
      SELECT id, ai_generated_plan, completed
      FROM workouts
      WHERE telegram_id = $1 AND workout_date = $2
    `, [telegramId, workoutDate]);
    const row = result.rows[0];
    if (!row) {
        return null;
    }
    return { id: row.id, plan: row.ai_generated_plan, completed: row.completed };
}
export async function markWorkoutCompleted(workoutId, completionNotes) {
    await db.query(`
      UPDATE workouts
      SET completed = TRUE, completion_notes = $2
      WHERE id = $1
    `, [workoutId, completionNotes]);
}
export async function saveExerciseLog(input) {
    await db.query(`
      INSERT INTO exercise_logs
      (workout_id, exercise_name, sets_completed, reps_completed, weight_used, duration_seconds)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
        input.workoutId,
        input.exerciseName,
        input.setsCompleted,
        input.repsCompleted,
        input.weightUsed ?? null,
        input.durationSeconds ?? null,
    ]);
}
export async function getRecentWorkouts(telegramId, limit) {
    const result = await db.query(`
      SELECT ai_generated_plan
      FROM workouts
      WHERE telegram_id = $1
      ORDER BY workout_date DESC
      LIMIT $2
    `, [telegramId, limit]);
    return result.rows.map((row) => row.ai_generated_plan);
}
export async function countCompletedThisWeek(telegramId) {
    const result = await db.query(`
      SELECT COUNT(*)::int AS workout_count
      FROM workouts
      WHERE telegram_id = $1
        AND workout_date >= date_trunc('week', CURRENT_DATE)::date
    `, [telegramId]);
    return result.rows[0]?.workout_count ?? 0;
}

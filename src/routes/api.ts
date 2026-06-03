import { Router } from "express";
import {
  getWorkoutByDate,
  markWorkoutCompleted,
  saveExerciseLog,
} from "../database/workouts-repo.js";
import {
  canGenerateWorkout,
  ensureDefaultUser,
  getOrCreateTodayWorkout,
} from "../services/workout-service.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

apiRouter.get("/workout/today", async (req, res) => {
  try {
    const telegramId = Number(req.query.telegramId);
    if (!telegramId) {
      return res.status(400).json({ error: "telegramId is required" });
    }
    await ensureDefaultUser(telegramId);
    const allowed = await canGenerateWorkout(telegramId);
    if (!allowed) {
      return res.status(402).json({ error: "Weekly free limit reached. Upgrade to premium." });
    }
    const plan = await getOrCreateTodayWorkout(telegramId);
    return res.json(plan);
  } catch (err) {
    console.error("GET /workout/today failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

apiRouter.post("/workout/complete", async (req, res) => {
  const { telegramId, completionNotes, exercises } = req.body as {
    telegramId: number;
    completionNotes: string;
    exercises: Array<{
      exerciseName: string;
      setsCompleted: number;
      repsCompleted: number[];
      weightUsed?: number;
      durationSeconds?: number;
    }>;
  };

  const today = new Date().toISOString().slice(0, 10);
  const workout = await getWorkoutByDate(telegramId, today);
  if (!workout) {
    return res.status(404).json({ error: "Workout not found for today" });
  }

  await markWorkoutCompleted(workout.id, completionNotes ?? "");
  for (const entry of exercises ?? []) {
    await saveExerciseLog({
      workoutId: workout.id,
      exerciseName: entry.exerciseName,
      setsCompleted: entry.setsCompleted,
      repsCompleted: entry.repsCompleted,
      weightUsed: entry.weightUsed,
      durationSeconds: entry.durationSeconds,
    });
  }

  return res.json({ ok: true });
});

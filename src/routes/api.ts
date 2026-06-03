import { Router } from "express";
import {
  getWorkoutByDate,
  markWorkoutCompleted,
  saveExerciseLog,
} from "../database/workouts-repo.js";
import { parseLocale } from "../types/locale.js";
import { parseGender, parseTrainingMode } from "../types/profile.js";
import { getUser, setUserLanguage, updateUserProfile } from "../database/users-repo.js";
import {
  canGenerateWorkout,
  ensureDefaultUser,
  getGymProgramForUser,
  getOrCreateTodayWorkout,
  userToApiProfile,
} from "../services/workout-service.js";
import { createPremiumInvoiceLink } from "../bot/payments.js";
import type { FitnessLevel } from "../types/workout.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

apiRouter.get("/user/profile", async (req, res) => {
  const telegramId = Number(req.query.telegramId);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  await ensureDefaultUser(telegramId);
  const user = await getUser(telegramId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(userToApiProfile(user));
});

apiRouter.put("/user/profile", async (req, res) => {
  const body = req.body as {
    telegramId: number;
    gender?: string;
    age?: number;
    weightKg?: number;
    heightCm?: number;
    fitnessLevel?: FitnessLevel;
    trainingMode?: string;
    language?: string;
    timePerSession?: number;
    goals?: string[];
  };
  if (!body.telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  await ensureDefaultUser(body.telegramId);
  const user = await updateUserProfile(body.telegramId, {
    gender: body.gender !== undefined ? parseGender(body.gender) : undefined,
    age: body.age,
    weightKg: body.weightKg,
    heightCm: body.heightCm,
    fitnessLevel: body.fitnessLevel,
    trainingMode: body.trainingMode !== undefined ? parseTrainingMode(body.trainingMode) : undefined,
    language: body.language ? parseLocale(body.language) : undefined,
    timePerSession: body.timePerSession,
    goals: body.goals,
  });
  return res.json(userToApiProfile(user));
});

apiRouter.get("/user/settings", async (req, res) => {
  const telegramId = Number(req.query.telegramId);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  await ensureDefaultUser(telegramId);
  const user = await getUser(telegramId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(userToApiProfile(user));
});

apiRouter.post("/user/language", async (req, res) => {
  const { telegramId, language } = req.body as { telegramId: number; language: string };
  if (!telegramId || !language) {
    return res.status(400).json({ error: "telegramId and language are required" });
  }
  const locale = parseLocale(language);
  await ensureDefaultUser(telegramId);
  await setUserLanguage(telegramId, locale);
  return res.json({ ok: true, language: locale });
});

apiRouter.get("/premium/invoice-link", async (req, res) => {
  const telegramId = Number(req.query.telegramId);
  const language = parseLocale(req.query.language);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  try {
    const url = await createPremiumInvoiceLink(telegramId, language);
    return res.json({ url });
  } catch (err) {
    console.error("invoice-link failed:", err);
    return res.status(500).json({ error: "Could not create invoice" });
  }
});

apiRouter.get("/workout/gym-program", async (req, res) => {
  try {
    const telegramId = Number(req.query.telegramId);
    if (!telegramId) {
      return res.status(400).json({ error: "telegramId is required" });
    }
    await ensureDefaultUser(telegramId);
    const program = await getGymProgramForUser(telegramId);
    return res.json(program);
  } catch (err) {
    if (err instanceof Error && err.message === "PREMIUM_REQUIRED") {
      return res.status(402).json({ error: "premium_required", code: "PREMIUM_REQUIRED" });
    }
    console.error("GET /workout/gym-program failed:", err);
    return res.status(500).json({ error: "Failed to load gym program" });
  }
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
      return res.status(402).json({
        error: "Weekly free limit reached",
        code: "FREE_LIMIT",
      });
    }
    const plan = await getOrCreateTodayWorkout(telegramId);
    const user = await getUser(telegramId);
    return res.json({
      plan,
      profile: user ? userToApiProfile(user) : null,
    });
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

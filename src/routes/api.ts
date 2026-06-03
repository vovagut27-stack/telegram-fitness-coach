import { Router } from "express";
import {
  getWorkoutByDate,
  markWorkoutCompleted,
  saveExerciseLog,
} from "../database/workouts-repo.js";
import { parseLocale } from "../types/locale.js";
import { parseGender } from "../types/profile.js";
import { ensureUserRow, getUser, setUserLanguage, updateUserProfile } from "../database/users-repo.js";
import { parseTelegramId } from "../utils/telegram-id.js";
import {
  canGenerateWorkout,
  ensureDefaultUser,
  getGymProgramForUser,
  getOrCreateWorkoutForDate,
  getOrCreateTodayWorkout,
  getWorkoutSchedule,
  userToApiProfile,
} from "../services/workout-service.js";
import { createPremiumInvoiceLink } from "../bot/payments.js";
import { isoDateOnly } from "../services/schedule-service.js";
import type { FitnessLevel } from "../types/workout.js";

export const apiRouter = Router();

async function saveProfileHandler(
  body: {
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
  },
  res: import("express").Response,
): Promise<void> {
  const telegramId = parseTelegramId(body.telegramId);
  if (!telegramId) {
    res.status(400).json({ error: "telegramId is required" });
    return;
  }
  try {
    await ensureUserRow(telegramId);
    const user = await updateUserProfile(telegramId, {
      gender: body.gender !== undefined ? parseGender(body.gender) : undefined,
      age: body.age,
      weightKg: body.weightKg,
      heightCm: body.heightCm,
      fitnessLevel: body.fitnessLevel,
      language: body.language ? parseLocale(body.language) : undefined,
      timePerSession: body.timePerSession,
      goals: body.goals,
    });
    res.json(userToApiProfile(user));
  } catch (err) {
    console.error("save profile failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    res.status(500).json({ error: message });
  }
}

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

apiRouter.get("/user/profile", async (req, res) => {
  const telegramId = parseTelegramId(req.query.telegramId);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  try {
    await ensureUserRow(telegramId);
    const user = await getUser(telegramId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(userToApiProfile(user));
  } catch (err) {
    console.error("GET /user/profile failed:", err);
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

apiRouter.put("/user/profile", (req, res) => void saveProfileHandler(req.body, res));
apiRouter.post("/user/profile", (req, res) => void saveProfileHandler(req.body, res));

apiRouter.get("/user/settings", async (req, res) => {
  const telegramId = parseTelegramId(req.query.telegramId);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  await ensureUserRow(telegramId);
  const user = await getUser(telegramId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(userToApiProfile(user));
});

apiRouter.post("/user/language", async (req, res) => {
  const { telegramId: rawId, language } = req.body as { telegramId: number; language: string };
  const telegramId = parseTelegramId(rawId);
  if (!telegramId || !language) {
    return res.status(400).json({ error: "telegramId and language are required" });
  }
  const locale = parseLocale(language);
  await ensureUserRow(telegramId);
  await setUserLanguage(telegramId, locale);
  return res.json({ ok: true, language: locale });
});

apiRouter.get("/premium/invoice-link", async (req, res) => {
  const telegramId = parseTelegramId(req.query.telegramId);
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

apiRouter.get("/workout/schedule", async (req, res) => {
  try {
    const telegramId = parseTelegramId(req.query.telegramId);
    const days = Math.min(14, Math.max(1, Number(req.query.days) || 7));
    if (!telegramId) {
      return res.status(400).json({ error: "telegramId is required" });
    }
    const schedule = await getWorkoutSchedule(telegramId, days);
    return res.json({ days: schedule });
  } catch (err) {
    console.error("GET /workout/schedule failed:", err);
    return res.status(500).json({ error: "Failed to load schedule" });
  }
});

apiRouter.get("/workout/by-date", async (req, res) => {
  try {
    const telegramId = parseTelegramId(req.query.telegramId);
    const date = String(req.query.date ?? isoDateOnly());
    if (!telegramId) {
      return res.status(400).json({ error: "telegramId is required" });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Invalid date format (YYYY-MM-DD)" });
    }
    await ensureUserRow(telegramId);
    const existing = await getWorkoutByDate(telegramId, date);
    if (!existing) {
      const allowed = await canGenerateWorkout(telegramId);
      if (!allowed) {
        return res.status(402).json({
          error: "Weekly free limit reached",
          code: "FREE_LIMIT",
        });
      }
    }
    const plan = await getOrCreateWorkoutForDate(telegramId, date);
    const user = await getUser(telegramId);
    const row = await getWorkoutByDate(telegramId, date);
    return res.json({
      date,
      plan: { ...plan, programType: plan.programType ?? "daily" },
      completed: row?.completed ?? false,
      profile: user ? userToApiProfile(user) : null,
    });
  } catch (err) {
    console.error("GET /workout/by-date failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

apiRouter.get("/workout/gym-program", async (req, res) => {
  try {
    const telegramId = parseTelegramId(req.query.telegramId);
    if (!telegramId) {
      return res.status(400).json({ error: "telegramId is required" });
    }
    await ensureUserRow(telegramId);
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
    const telegramId = parseTelegramId(req.query.telegramId);
    if (!telegramId) {
      return res.status(400).json({ error: "telegramId is required" });
    }
    const today = isoDateOnly();
    await ensureUserRow(telegramId);
    const existing = await getWorkoutByDate(telegramId, today);
    if (!existing) {
      const allowed = await canGenerateWorkout(telegramId);
      if (!allowed) {
        return res.status(402).json({
          error: "Weekly free limit reached",
          code: "FREE_LIMIT",
        });
      }
    }
    const plan = await getOrCreateTodayWorkout(telegramId);
    const user = await getUser(telegramId);
    return res.json({
      date: today,
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
  try {
    const { telegramId: rawId, workoutDate, completionNotes, exercises } = req.body as {
      telegramId: number;
      workoutDate?: string;
      completionNotes: string;
      exercises: Array<{
        exerciseName: string;
        setsCompleted: number;
        repsCompleted: number[];
        weightUsed?: number;
        durationSeconds?: number;
      }>;
    };

    const telegramId = parseTelegramId(rawId);
    if (!telegramId) {
      return res.status(400).json({ error: "telegramId is required" });
    }

    const date = workoutDate ?? isoDateOnly();
    const workout = await getWorkoutByDate(telegramId, date);
    if (!workout) {
      return res.status(404).json({ error: "Workout not found for this date" });
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

    return res.json({ ok: true, date });
  } catch (err) {
    console.error("POST /workout/complete failed:", err);
    return res.status(500).json({ error: "Failed to save workout" });
  }
});

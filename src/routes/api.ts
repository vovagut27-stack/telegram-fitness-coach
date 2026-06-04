import { Router } from "express";
import { getWorkoutByDate } from "../database/workouts-repo.js";
import { parseLocale } from "../types/locale.js";
import { parseGender } from "../types/profile.js";
import { ensureUserRow, getUser, setUserLanguage, updateUserProfile } from "../database/users-repo.js";
import { parseTelegramId } from "../utils/telegram-id.js";
import {
  canGenerateWorkout,
  ensureDefaultUser,
  getGymProgramForUser,
  getGymWorkoutSchedule,
  getOrCreateGymWorkoutForDate,
  getOrCreateWorkoutForDate,
  getOrCreateTodayWorkout,
  getWorkoutSchedule,
  buildApiUserProfile,
  userToApiProfile,
} from "../services/workout-service.js";
import { updateUserSettings } from "../database/users-repo.js";
import { createPremiumInvoiceLink } from "../bot/payments.js";
import { isoDateOnly } from "../services/schedule-service.js";
import { env } from "../config/env.js";
import {
  assertPremiumActive,
  isPremiumActive,
  maxResultsHistoryDays,
  maxScheduleDays,
} from "../services/premium-service.js";
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
    res.json(await buildApiUserProfile(user));
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
    return res.json(await buildApiUserProfile(user));
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
  return res.json(await buildApiUserProfile(user));
});

async function saveUserSettingsHandler(
  body: {
    telegramId: number;
    remindersEnabled?: boolean;
    reminderHour?: number;
    timezoneOffsetMinutes?: number;
    restPreset?: "short" | "normal" | "long";
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
    if (body.restPreset != null && body.restPreset !== "normal") {
      await assertPremiumActive(telegramId);
    }
    const user = await updateUserSettings(telegramId, {
      remindersEnabled: body.remindersEnabled,
      reminderHour: body.reminderHour,
      timezoneOffsetMinutes: body.timezoneOffsetMinutes,
      restPreset: body.restPreset,
    });
    res.json(await buildApiUserProfile(user));
  } catch (err) {
    if (err instanceof Error && err.message === "PREMIUM_REQUIRED") {
      res.status(402).json({ error: "premium_required", code: "PREMIUM_REQUIRED" });
      return;
    }
    console.error("save user settings failed:", err);
    res.status(500).json({ error: "Failed to save settings" });
  }
}

apiRouter.patch("/user/settings", (req, res) => void saveUserSettingsHandler(req.body, res));

apiRouter.post("/user/settings", (req, res) => void saveUserSettingsHandler(req.body, res));

apiRouter.get("/cron/reminders", async (req, res) => {
  const secret = env.CRON_SECRET.trim();
  if (!secret) {
    return res.status(503).json({ error: "CRON_SECRET not configured" });
  }
  const auth = String(req.headers.authorization ?? "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : String(req.query.secret ?? "");
  if (token !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { bot } = await import("../bot/index.js");
    const { sendDailyReminders } = await import("../services/reminder-service.js");
    const result = await sendDailyReminders(bot);
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error("GET /cron/reminders failed:", err);
    return res.status(500).json({ error: "Reminder job failed" });
  }
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
    if (!telegramId) {
      return res.status(400).json({ error: "telegramId is required" });
    }
    await ensureUserRow(telegramId);
    const user = await getUser(telegramId);
    const cap = maxScheduleDays(Boolean(user && isPremiumActive(user)));
    const requested = Math.max(1, Number(req.query.days) || cap);
    const days = Math.min(cap, requested);
    const scheduleDays = await getWorkoutSchedule(telegramId, days);
    return res.json({ days: scheduleDays, maxDays: cap });
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

apiRouter.get("/workout/gym-schedule", async (req, res) => {
  try {
    const telegramId = parseTelegramId(req.query.telegramId);
    const days = Math.min(14, Math.max(1, Number(req.query.days) || 7));
    if (!telegramId) {
      return res.status(400).json({ error: "telegramId is required" });
    }
    await ensureUserRow(telegramId);
    const scheduleDays = await getGymWorkoutSchedule(telegramId, days);
    return res.json({ days: scheduleDays });
  } catch (err) {
    if (err instanceof Error && err.message === "PREMIUM_REQUIRED") {
      return res.status(402).json({ error: "premium_required", code: "PREMIUM_REQUIRED" });
    }
    console.error("GET /workout/gym-schedule failed:", err);
    return res.status(500).json({ error: "Failed to load gym schedule" });
  }
});

apiRouter.get("/workout/gym-by-date", async (req, res) => {
  try {
    const telegramId = parseTelegramId(req.query.telegramId);
    const date = String(req.query.date ?? isoDateOnly());
    if (!telegramId) {
      return res.status(400).json({ error: "telegramId is required" });
    }
    await ensureUserRow(telegramId);
    const plan = await getOrCreateGymWorkoutForDate(telegramId, date);
    const row = await getWorkoutByDate(telegramId, date);
    return res.json({
      date,
      plan,
      completed: row?.completed ?? false,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "PREMIUM_REQUIRED") {
      return res.status(402).json({ error: "premium_required", code: "PREMIUM_REQUIRED" });
    }
    console.error("GET /workout/gym-by-date failed:", err);
    return res.status(500).json({ error: "Failed to load gym workout" });
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
    const { telegramId: rawId, workoutDate, completionNotes, exercises, gymMode } = req.body as {
      telegramId: number;
      workoutDate?: string;
      completionNotes: string;
      gymMode?: boolean;
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

    await ensureUserRow(telegramId);
    const date = workoutDate ?? isoDateOnly();
    const { completeWorkoutWithLogs } = await import("../services/workout-completion-service.js");
    const result = await completeWorkoutWithLogs({
      telegramId,
      workoutDate: date,
      completionNotes: completionNotes ?? "",
      exercises: exercises ?? [],
      gymMode: Boolean(gymMode),
    });

    return res.json({ ok: true, date: result.date, exerciseCount: result.exerciseCount });
  } catch (err) {
    console.error("POST /workout/complete failed:", err);
    return res.status(500).json({ error: "Failed to save workout" });
  }
});

apiRouter.get("/user/stats", async (req, res) => {
  const telegramId = parseTelegramId(req.query.telegramId);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  try {
    await ensureUserRow(telegramId);
    const { getUserStats } = await import("../services/results-service.js");
    const stats = await getUserStats(telegramId);
    return res.json(stats);
  } catch (err) {
    console.error("GET /user/stats failed:", err);
    return res.status(500).json({ error: "Failed to load stats" });
  }
});

apiRouter.get("/user/weight-history", async (req, res) => {
  const telegramId = parseTelegramId(req.query.telegramId);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  try {
    await ensureUserRow(telegramId);
    const { getUserWeightHistory } = await import("../services/results-service.js");
    const data = await getUserWeightHistory(telegramId);
    return res.json(data);
  } catch (err) {
    console.error("GET /user/weight-history failed:", err);
    return res.status(500).json({ error: "Failed to load weight history" });
  }
});

apiRouter.post("/user/weight", async (req, res) => {
  const body = req.body as {
    telegramId: number;
    weightKg: number;
    logDate?: string;
    note?: string;
  };
  const telegramId = parseTelegramId(body.telegramId);
  if (!telegramId || body.weightKg == null) {
    return res.status(400).json({ error: "telegramId and weightKg are required" });
  }
  try {
    await ensureUserRow(telegramId);
    const { logUserWeight } = await import("../services/results-service.js");
    const { setUserWeightKg } = await import("../database/users-repo.js");
    const entries = await logUserWeight(telegramId, body.weightKg, body.logDate, body.note);
    await setUserWeightKg(telegramId, body.weightKg);
    return res.json({ entries });
  } catch (err) {
    console.error("POST /user/weight failed:", err);
    return res.status(500).json({ error: "Failed to save weight" });
  }
});

apiRouter.get("/user/premium-insights", async (req, res) => {
  const telegramId = parseTelegramId(req.query.telegramId);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  try {
    await assertPremiumActive(telegramId);
    const { getPremiumInsights } = await import("../services/premium-insights-service.js");
    return res.json(await getPremiumInsights(telegramId));
  } catch (err) {
    if (err instanceof Error && err.message === "PREMIUM_REQUIRED") {
      return res.status(402).json({ error: "premium_required", code: "PREMIUM_REQUIRED" });
    }
    console.error("GET /user/premium-insights failed:", err);
    return res.status(500).json({ error: "Failed to load insights" });
  }
});

apiRouter.get("/workout/personal-records", async (req, res) => {
  const telegramId = parseTelegramId(req.query.telegramId);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  try {
    await assertPremiumActive(telegramId);
    const { getPersonalRecords } = await import("../services/personal-records-service.js");
    const records = await getPersonalRecords(telegramId, 15);
    return res.json({ records });
  } catch (err) {
    if (err instanceof Error && err.message === "PREMIUM_REQUIRED") {
      return res.status(402).json({ error: "premium_required", code: "PREMIUM_REQUIRED" });
    }
    console.error("GET /workout/personal-records failed:", err);
    return res.status(500).json({ error: "Failed to load records" });
  }
});

apiRouter.get("/workout/results", async (req, res) => {
  const telegramId = parseTelegramId(req.query.telegramId);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  try {
    await ensureUserRow(telegramId);
    const user = await getUser(telegramId);
    const cap = maxResultsHistoryDays(Boolean(user && isPremiumActive(user)));
    const requested = Math.max(7, Number(req.query.days) || cap);
    const days = Math.min(cap, requested);
    const { listWorkoutResults, getResultsComparison } = await import(
      "../services/results-service.js"
    );
    const [results, comparison] = await Promise.all([
      listWorkoutResults(telegramId, days),
      getResultsComparison(telegramId),
    ]);
    return res.json({ results, comparison, maxHistoryDays: cap });
  } catch (err) {
    console.error("GET /workout/results failed:", err);
    return res.status(500).json({ error: "Failed to load results" });
  }
});

apiRouter.get("/workout/plan-for-date", async (req, res) => {
  const telegramId = parseTelegramId(req.query.telegramId);
  const date = String(req.query.date ?? isoDateOnly());
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  try {
    const { getPlanForResultsDate } = await import("../services/results-service.js");
    const plan = await getPlanForResultsDate(telegramId, date);
    return res.json({ date, plan });
  } catch (err) {
    console.error("GET /workout/plan-for-date failed:", err);
    return res.status(500).json({ error: "Failed to load plan" });
  }
});

apiRouter.post("/workout/results/manual", async (req, res) => {
  const body = req.body as {
    telegramId: number;
    workoutDate: string;
    completionNotes?: string;
    exercises: Array<{
      exerciseName: string;
      setsCompleted: number;
      repsCompleted: number[];
      weightUsed?: number;
      durationSeconds?: number;
    }>;
  };
  const telegramId = parseTelegramId(body.telegramId);
  if (!telegramId || !body.workoutDate) {
    return res.status(400).json({ error: "telegramId and workoutDate are required" });
  }
  try {
    await ensureUserRow(telegramId);
    const { saveManualWorkoutResults } = await import("../services/results-service.js");
    const saved = await saveManualWorkoutResults(
      telegramId,
      body.workoutDate,
      body.exercises.map((e) => ({
        exerciseName: e.exerciseName,
        setsCompleted: e.setsCompleted,
        repsCompleted: e.repsCompleted,
        weightUsed: e.weightUsed ?? null,
        durationSeconds: e.durationSeconds ?? null,
      })),
      body.completionNotes,
    );
    return res.json({ ok: true, day: saved });
  } catch (err) {
    console.error("POST /workout/results/manual failed:", err);
    return res.status(500).json({ error: "Failed to save results" });
  }
});

import { env } from "../config/env.js";
import type { Locale } from "../types/locale.js";
import type { Gender } from "../types/profile.js";
import type { WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { enrichWorkoutExercises } from "./exercise-images.js";
import {
  catalogEntryForAi,
  exerciseCountForMinutes,
  filterCatalogByTargets,
  getExerciseCatalog,
  resolveCatalogExercises,
  type CatalogMode,
} from "./exercise-catalog.js";
import { GYM_READY_SPLITS } from "./gym-ready-splits.js";
import { buildTemplateWorkout } from "./workout-templates.js";

const AI_TIMEOUT_MS = 10_000;

export type AiPickResult = {
  exerciseIds: string[];
  notes?: string;
};

let openaiClient: import("openai").OpenAI | null = null;

async function getOpenAIClient(): Promise<import("openai").OpenAI | null> {
  if (!env.OPENAI_API_KEY?.trim()) {
    return null;
  }
  if (!openaiClient) {
    const { OpenAI } = await import("openai");
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      timeout: AI_TIMEOUT_MS,
      maxRetries: 0,
    });
  }
  return openaiClient;
}

function parseAiJson(text: string): AiPickResult | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  try {
    const parsed = JSON.parse(raw) as AiPickResult;
    if (!Array.isArray(parsed.exerciseIds)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Детерминированный набор из каталога, если AI недоступен. */
export function pickExercisesDeterministic(
  mode: CatalogMode,
  targets: string[],
  count: number,
  seed: string,
): string[] {
  const pool = filterCatalogByTargets(getExerciseCatalog(mode), targets);
  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  let h = hashSeed(seed);
  const ids: string[] = [];
  const used = new Set<string>();

  while (ids.length < count && used.size < sorted.length) {
    h = (h * 1103515245 + 12345) | 0;
    const idx = Math.abs(h) % sorted.length;
    const entry = sorted[idx];
    if (!used.has(entry.id)) {
      used.add(entry.id);
      ids.push(entry.id);
    }
  }
  return ids;
}

async function callOpenAiPicker(
  locale: Locale,
  request: WorkoutRequest,
  mode: CatalogMode,
  pool: ReturnType<typeof catalogEntryForAi>[],
  count: number,
): Promise<AiPickResult | null> {
  const client = await getOpenAIClient();
  if (!client) {
    return null;
  }

  const profileParts: string[] = [];
  if (request.gender) {
    profileParts.push(locale === "ru" ? `пол: ${request.gender}` : `gender: ${request.gender}`);
  }
  if (request.age) {
    profileParts.push(locale === "ru" ? `возраст: ${request.age}` : `age: ${request.age}`);
  }
  if (request.bmi) {
    profileParts.push(`BMI: ${request.bmi}`);
  }

  const system =
    locale === "ru"
      ? `Ты фитнес-тренер. Составь тренировку ТОЛЬКО из списка allowedExercises.
Верни строго JSON без markdown:
{"exerciseIds":["id1","id2",...],"notes":"кратко"}
Правила:
- Ровно ${count} РАЗНЫХ id из списка (скопируй id точно).
- Фокус дня: ${(request.targetMuscles ?? []).join(", ")}.
- Уровень: ${request.fitnessLevel}.
- 1–2 упражнения cardio/mobility в начале, если есть в списке и уместно.
- Не придумывай новые упражнения.`
      : `You are a fitness coach. Build a workout ONLY from allowedExercises.
Return strict JSON, no markdown:
{"exerciseIds":["id1","id2",...],"notes":"brief"}
Rules:
- Exactly ${count} DIFFERENT ids from the list (copy ids exactly).
- Day focus: ${(request.targetMuscles ?? []).join(", ")}.
- Level: ${request.fitnessLevel}.
- 1–2 cardio/mobility moves at the start when appropriate.
- Do not invent exercises.`;

  const userPayload = {
    profile: profileParts.join(", ") || "adult",
    minutes: request.timeMinutes,
    equipment: request.availableEquipment,
    goals: request.goals,
    recentFocus: request.lastWorkouts
      .slice(0, 2)
      .map((w) => w.targetMuscles?.join(", ")),
    allowedExercises: pool,
  };

  try {
    const aiCall = client.responses.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      input: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
    });

    const timeout = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), AI_TIMEOUT_MS);
    });

    const response = await Promise.race([aiCall, timeout]);
    if (!response?.output_text?.trim()) {
      return null;
    }
    return parseAiJson(response.output_text);
  } catch (err) {
    console.error("AI workout picker failed:", err);
    return null;
  }
}

export async function generateWorkoutWithAiPicker(
  request: WorkoutRequest,
  options: {
    mode: CatalogMode;
    workoutDate?: string;
    splitTitle?: string;
    programType?: "daily" | "gym";
    dayKey?: string;
  },
): Promise<WorkoutPlan> {
  const locale: Locale = request.language === "en" ? "en" : "ru";
  const mode = options.mode;
  const targets = request.targetMuscles ?? [];
  const count = exerciseCountForMinutes(request.timeMinutes, mode);
  const catalog = getExerciseCatalog(mode);
  const pool = filterCatalogByTargets(catalog, targets).map((e) =>
    catalogEntryForAi(e, locale),
  );

  const seed = `${request.userId}-${options.workoutDate ?? "today"}-${targets.join("-")}`;
  let pick = await callOpenAiPicker(locale, request, mode, pool, count);

  let ids = pick?.exerciseIds ?? [];
  if (ids.length < Math.min(4, count)) {
    ids = pickExercisesDeterministic(mode, targets, count, seed);
  }

  let exercises = resolveCatalogExercises(ids, mode, locale);
  if (exercises.length < 4) {
    ids = pickExercisesDeterministic(mode, targets, count, `${seed}-fallback`);
    exercises = resolveCatalogExercises(ids, mode, locale);
  }

  if (exercises.length < 4 && mode === "gym" && options.dayKey) {
    const day = GYM_READY_SPLITS.find((d) => d.dayKey === options.dayKey);
    if (day) {
      exercises = day.exercises.map((item) =>
        locale === "en" ? { ...item.en } : { ...item.ru },
      );
    }
  }

  if (exercises.length < 4) {
    return buildTemplateWorkout(request, options.workoutDate);
  }

  exercises = enrichWorkoutExercises(
    exercises.slice(0, count),
    request.gender as Gender | null | undefined,
    request.fitnessLevel,
  );

  const perExerciseMinutes = Math.max(4, Math.round(request.timeMinutes / exercises.length));
  const notes =
    pick?.notes?.trim() ||
    (locale === "ru"
      ? `Подбор AI · фокус: ${targets.join(", ")}. Разминка 3–5 мин.`
      : `AI selection · focus: ${targets.join(", ")}. Warm up 3–5 min.`);

  return {
    targetMuscles: targets.length ? [...targets] : ["full body"],
    exercises,
    totalMinutes: perExerciseMinutes * exercises.length,
    difficultyLevel: request.fitnessLevel,
    notes,
    programType: options.programType ?? (mode === "gym" ? "gym" : "daily"),
    splitDay: options.splitTitle,
    homeDayKey: mode === "home" ? options.dayKey : undefined,
    gymDayKey: mode === "gym" ? options.dayKey : undefined,
  };
}

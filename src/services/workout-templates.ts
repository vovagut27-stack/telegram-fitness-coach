import type { Locale } from "../types/locale.js";
import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise, WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { getSplitForDate } from "./schedule-service.js";
import { enrichExerciseImage, enrichWorkoutExercises } from "./exercise-images.js";
import {
  HOME_CLASSIC_POOLS,
  HOME_FOCUS_LABELS,
  type MuscleFocus,
  type LocalizedExercise,
} from "./home-classic-pools.js";

const POOLS = HOME_CLASSIC_POOLS;
const FOCUS_LABELS: Record<MuscleFocus, Record<Locale, string[]>> = HOME_FOCUS_LABELS;

export function muscleFocusFromTargets(targetMuscles?: string[]): MuscleFocus {
  const joined = (targetMuscles ?? []).join(" ").toLowerCase();
  if (/leg|glute|ног|ягод/.test(joined) && !/chest|груд|triceps|трицеп/.test(joined)) {
    return "legs";
  }
  if (/leg|glute|core|ног|ягод|пресс/.test(joined)) {
    return "legs";
  }
  if (/back|biceps|спин|бицеп/.test(joined)) {
    return "pull";
  }
  if (/chest|triceps|груд|трицеп/.test(joined)) {
    return "push";
  }
  return "push";
}

/** План в БД соответствует дню расписания (ноги / спина / грудь)? */
export function planMatchesDaySplit(
  plan: WorkoutPlan,
  isoDate: string,
  locale: Locale,
): boolean {
  if (plan.programType === "gym") {
    return false;
  }
  const split = getSplitForDate(isoDate, locale);
  const expected = muscleFocusFromTargets(split.muscles);
  const actual = muscleFocusFromTargets(plan.targetMuscles);
  return expected === actual;
}

function exerciseCountForTime(timeMinutes: number): number {
  if (timeMinutes <= 20) {
    return 4;
  }
  if (timeMinutes <= 35) {
    return 5;
  }
  return 6;
}

function recentExerciseNames(lastWorkouts: WorkoutPlan[]): Set<string> {
  const names = new Set<string>();
  for (const workout of lastWorkouts.slice(0, 3)) {
    for (const ex of workout.exercises) {
      names.add(ex.name.toLowerCase());
    }
  }
  return names;
}

function localize(item: LocalizedExercise, locale: Locale): WorkoutExercise {
  return enrichExerciseImage(item[locale] ?? item.en);
}

function filterByEquipment(
  exercises: WorkoutExercise[],
  availableEquipment: string[],
): WorkoutExercise[] {
  const allowed = new Set(availableEquipment.map((e) => e.toLowerCase()));
  allowed.add("none");
  allowed.add("bodyweight");
  return exercises.filter((ex) => {
    const eq = ex.equipment.toLowerCase();
    if (eq === "none" || eq === "bodyweight") {
      return true;
    }
    return [...allowed].some((a) => eq.includes(a) || a.includes(eq));
  });
}

export function buildTemplateWorkout(request: WorkoutRequest): WorkoutPlan {
  const locale = request.language === "en" ? "en" : "ru";
  const focus = muscleFocusFromTargets(request.targetMuscles);
  const level = request.fitnessLevel;
  const pool = POOLS[focus][level] ?? POOLS[focus].beginner;
  const count = exerciseCountForTime(request.timeMinutes);
  const recent = recentExerciseNames(request.lastWorkouts);

  let candidates = pool
    .map((item) => localize(item, locale))
    .filter((ex) => !recent.has(ex.name.toLowerCase()));

  if (candidates.length < count) {
    candidates = pool.map((item) => localize(item, locale));
  }

  candidates = filterByEquipment(candidates, request.availableEquipment);
  if (candidates.length < count) {
    candidates = pool.map((item) => localize(item, locale));
  }

  const exercises = candidates.slice(0, count).map((ex) => personalizeExercise(ex, request));
  const perExerciseMinutes = Math.max(4, Math.round(request.timeMinutes / exercises.length));

  const profileNote =
    locale === "ru"
      ? profileNoteRu(request)
      : profileNoteEn(request);

  return {
    targetMuscles: FOCUS_LABELS[focus][locale],
    exercises,
    totalMinutes: perExerciseMinutes * exercises.length,
    difficultyLevel: level,
    notes: profileNote
      ? `${profileNote} · ${locale === "ru" ? "Разминка 3–5 мин." : "Warm up 3–5 min."}`
      : locale === "ru"
        ? "Разминка 3–5 мин, между подходами отдых по плану."
        : "Warm up 3–5 min, rest between sets as listed.",
    programType: "daily",
  };
}

function personalizeExercise(ex: WorkoutExercise, request: WorkoutRequest): WorkoutExercise {
  let sets = ex.sets;
  const age = request.age ?? 30;
  const bmi = request.bmi ?? 22;

  if (request.fitnessLevel === "beginner") {
    sets = Math.max(2, sets - 1);
  } else if (request.fitnessLevel === "advanced") {
    sets = Math.min(sets + 1, 6);
  }

  if (request.fitnessLevel === "beginner" && (age >= 55 || (bmi != null && bmi >= 30))) {
    sets = Math.max(2, sets - 1);
  }

  return { ...ex, sets };
}

function profileNoteRu(request: WorkoutRequest): string {
  const parts: string[] = [];
  if (request.gender === "female") {
    parts.push("учтён женский профиль");
  }
  if (request.age && request.age >= 50) {
    parts.push("щадящая нагрузка по возрасту");
  }
  if (request.bmi && request.bmi >= 28) {
    parts.push("снижен объём из‑за BMI");
  }
  return parts.length ? `План: ${parts.join(", ")}` : "";
}

function profileNoteEn(request: WorkoutRequest): string {
  const parts: string[] = [];
  if (request.gender === "female") {
    parts.push("female profile");
  }
  if (request.age && request.age >= 50) {
    parts.push("age-adjusted volume");
  }
  if (request.bmi && request.bmi >= 28) {
    parts.push("BMI-adjusted volume");
  }
  return parts.length ? `Plan: ${parts.join(", ")}` : "";
}

const MIN_EXERCISES = 4;

export function normalizeWorkoutPlan(plan: WorkoutPlan, request: WorkoutRequest): WorkoutPlan {
  const exercises = [...(plan.exercises ?? [])].filter((ex) => ex?.name?.trim());
  if (exercises.length >= MIN_EXERCISES) {
    return {
      ...plan,
      exercises: enrichWorkoutExercises(
        exercises.slice(0, 6),
        request.gender as Gender | null | undefined,
        request.fitnessLevel,
      ),
    };
  }

  const template = buildTemplateWorkout(request);
  const seen = new Set(exercises.map((e) => e.name.toLowerCase()));
  for (const ex of template.exercises) {
    if (exercises.length >= MIN_EXERCISES) {
      break;
    }
    if (!seen.has(ex.name.toLowerCase())) {
      exercises.push(ex);
      seen.add(ex.name.toLowerCase());
    }
  }

  return {
    ...plan,
    exercises: enrichWorkoutExercises(
      exercises,
      request.gender as Gender | null | undefined,
      request.fitnessLevel,
    ),
    targetMuscles: plan.targetMuscles?.length ? plan.targetMuscles : template.targetMuscles,
    totalMinutes: plan.totalMinutes || template.totalMinutes,
    difficultyLevel: plan.difficultyLevel ?? request.fitnessLevel,
    notes: plan.notes ?? template.notes,
  };
}

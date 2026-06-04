import type { Locale } from "../types/locale.js";
import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise, WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { isoDateOnly } from "./schedule-service.js";
import { enrichExerciseImage, enrichWorkoutExercises } from "./exercise-images.js";
import {
  getHomeReadyDay,
  homeWorkoutIndexForDate,
  HOME_READY_SPLITS,
} from "./home-ready-splits.js";

export function muscleFocusFromTargets(targetMuscles?: string[]): string {
  return (targetMuscles ?? []).join(" ");
}

/** План в БД соответствует дню готовой домашней тренировки? */
export function planMatchesDaySplit(
  plan: WorkoutPlan,
  isoDate: string,
  _locale: Locale,
): boolean {
  if (plan.programType === "gym") {
    return false;
  }
  const expected = HOME_READY_SPLITS[homeWorkoutIndexForDate(isoDate)]?.dayKey;
  if (plan.homeDayKey && expected) {
    return plan.homeDayKey === expected;
  }
  return false;
}

export function buildTemplateWorkout(
  request: WorkoutRequest,
  workoutDate: string = isoDateOnly(),
): WorkoutPlan {
  const locale = request.language === "en" ? "en" : "ru";
  const day = getHomeReadyDay(workoutDate, locale);
  const exercises = day.exercises.map((item) =>
    enrichExerciseImage(item[locale] ?? item.en, request.gender as Gender | null | undefined),
  );

  return {
    targetMuscles: locale === "en" ? day.focus.en : day.focus.ru,
    exercises,
    totalMinutes: day.totalMinutes,
    difficultyLevel: request.fitnessLevel,
    notes: locale === "en" ? day.description.en : day.description.ru,
    programType: "daily",
    homeDayKey: day.dayKey,
    splitDay: locale === "en" ? day.labels.en : day.labels.ru,
  };
}

const MIN_EXERCISES = 4;

export function normalizeWorkoutPlan(plan: WorkoutPlan, request: WorkoutRequest): WorkoutPlan {
  const exercises = [...(plan.exercises ?? [])].filter((ex) => ex?.name?.trim());
  if (exercises.length >= MIN_EXERCISES) {
    return {
      ...plan,
      exercises: enrichWorkoutExercises(
        exercises,
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
    homeDayKey: plan.homeDayKey ?? template.homeDayKey,
  };
}

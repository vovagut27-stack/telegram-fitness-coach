import type { Locale } from "../types/locale.js";
import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise, WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { targetMusclesToTags } from "./exercise-catalog.js";
import { getSplitForDate, isoDateOnly } from "./schedule-service.js";
import { enrichExerciseImage, enrichWorkoutExercises } from "./exercise-images.js";
import { getHomeReadyDay } from "./home-ready-splits.js";

function targetsOverlap(planTargets: string[], splitTargets: string[]): boolean {
  const planTags = new Set(targetMusclesToTags(planTargets));
  const splitTags = targetMusclesToTags(splitTargets);
  return splitTags.some((t) => planTags.has(t));
}

/** План соответствует фокусу дня в расписании (ноги / грудь / спина …). */
export function planMatchesDaySplit(
  plan: WorkoutPlan,
  isoDate: string,
  locale: Locale,
): boolean {
  if (plan.programType === "gym") {
    return false;
  }
  const split = getSplitForDate(isoDate, locale);
  if (!plan.targetMuscles?.length) {
    return false;
  }
  return targetsOverlap(plan.targetMuscles, split.muscles);
}

/** Фиксированная тренировка A/B/C — запас, если AI недоступен. */
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
        exercises.slice(0, 12),
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

import type { Locale } from "../types/locale.js";
import type { FitnessLevel, GymProgram, GymProgramDay, WorkoutPlan } from "../types/workout.js";
import type { UserProfile } from "../database/users-repo.js";
import { enrichWorkoutExercises } from "./exercise-images.js";
import { GYM_READY_SPLITS } from "./gym-ready-splits.js";
import {
  addDaysIso,
  dayOffsetFromToday,
  formatDayLabel,
  isoDateOnly,
} from "./schedule-service.js";
import type { ScheduleDayItem } from "./schedule-service.js";

const GYM_SPLITS = GYM_READY_SPLITS;

function dayPlan(
  split: (typeof GYM_SPLITS)[0],
  locale: Locale,
  level: FitnessLevel,
  user: UserProfile,
): WorkoutPlan {
  const exercises = enrichWorkoutExercises(
    split.exercises.map((e) => (locale === "en" ? e.en : e.ru)),
    user.gender,
    level,
  );

  return {
    targetMuscles: [locale === "en" ? split.focus.en : split.focus.ru],
    exercises,
    totalMinutes: split.totalMinutes,
    difficultyLevel: level,
    programType: "gym",
    splitDay: split.dayKey,
    notes: locale === "en" ? split.description.en : split.description.ru,
  };
}

export function buildGymProgram(user: UserProfile): GymProgram {
  const locale = user.language;
  const level = user.fitnessLevel;

  const days: GymProgramDay[] = GYM_SPLITS.map((d) => ({
    dayKey: d.dayKey,
    dayLabel: locale === "en" ? d.labels.en : d.labels.ru,
    focus: locale === "en" ? d.focus.en : d.focus.ru,
    plan: dayPlan(d, locale, level, user),
  }));

  return {
    title: locale === "en" ? "Gym · 2-day split" : "Зал · 2 тренировки",
    subtitle:
      locale === "en"
        ? "Chest & shoulders · Legs & shoulders"
        : "Грудь и плечи · Ноги и плечи",
    days,
  };
}

export function todayGymDayIndex(): number {
  return gymDayIndexForDate(isoDateOnly());
}

export function gymDayIndexForDate(isoDate: string): number {
  const offset = dayOffsetFromToday(isoDate);
  const len = GYM_SPLITS.length;
  return ((offset % len) + len) % len;
}

export function attachGymScheduleMeta(
  plan: WorkoutPlan,
  isoDate: string,
  locale: Locale,
  dayLabel: string,
  focus: string,
  dayKey: string,
): WorkoutPlan {
  const dateLabel = formatDayLabel(isoDate, locale);
  return {
    ...plan,
    programType: "gym",
    scheduleDate: isoDate,
    gymDayKey: dayKey,
    splitDay: `${dateLabel} · ${dayLabel}`,
    notes: plan.notes ? `${dateLabel} · ${plan.notes}` : `${dateLabel} · ${focus}`,
  };
}

export function buildGymScheduleSkeleton(
  user: UserProfile,
  fromDate: string,
  count: number,
): Omit<ScheduleDayItem, "completed" | "hasWorkout" | "previewExercises">[] {
  const locale = user.language;
  const program = buildGymProgram(user);
  const today = isoDateOnly();
  const items: Omit<ScheduleDayItem, "completed" | "hasWorkout" | "previewExercises">[] = [];

  for (let i = 0; i < count; i++) {
    const date = addDaysIso(fromDate, i);
    const idx = gymDayIndexForDate(date);
    const slot = program.days[idx] ?? program.days[0];
    items.push({
      date,
      dayLabel: formatDayLabel(date, locale),
      focusTitle: `${slot.dayLabel} · ${slot.focus}`,
      muscles: [slot.dayKey],
      isToday: date === today,
    });
  }
  return items;
}

export function getGymDayPlanForDate(user: UserProfile, isoDate: string): WorkoutPlan {
  const program = buildGymProgram(user);
  const idx = gymDayIndexForDate(isoDate);
  const slot = program.days[idx] ?? program.days[0];
  return attachGymScheduleMeta(
    slot.plan,
    isoDate,
    user.language,
    slot.dayLabel,
    slot.focus,
    slot.dayKey,
  );
}

export function getTodayGymWorkout(user: UserProfile): WorkoutPlan {
  const program = buildGymProgram(user);
  const idx = todayGymDayIndex();
  return program.days[idx]?.plan ?? program.days[0].plan;
}

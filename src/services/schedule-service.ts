import type { Locale } from "../types/locale.js";
import type { WorkoutPlan } from "../types/workout.js";

export interface DaySplit {
  titleRu: string;
  titleEn: string;
  muscles: string[];
}

export const DAY_SPLITS: DaySplit[] = [
  {
    titleRu: "День ног",
    titleEn: "Leg day",
    muscles: ["legs", "glutes", "core"],
  },
  {
    titleRu: "Спина и бицепс",
    titleEn: "Back & biceps",
    muscles: ["back", "biceps"],
  },
  {
    titleRu: "Грудь и трицепс",
    titleEn: "Chest & triceps",
    muscles: ["chest", "triceps", "shoulders"],
  },
  {
    titleRu: "Ноги и пресс",
    titleEn: "Legs & core",
    muscles: ["legs", "core", "glutes"],
  },
];

export function isoDateOnly(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return isoDateOnly(d);
}

export function dayOffsetFromToday(isoDate: string): number {
  const target = new Date(`${isoDate}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function splitIndexForDate(isoDate: string): number {
  const offset = dayOffsetFromToday(isoDate);
  return ((offset % DAY_SPLITS.length) + DAY_SPLITS.length) % DAY_SPLITS.length;
}

export function getSplitForDate(isoDate: string, locale: Locale): DaySplit & { title: string } {
  const split = DAY_SPLITS[splitIndexForDate(isoDate)] ?? DAY_SPLITS[0];
  return {
    ...split,
    title: locale === "en" ? split.titleEn : split.titleRu,
  };
}

export function formatDayLabel(isoDate: string, locale: Locale): string {
  const d = new Date(`${isoDate}T12:00:00`);
  const today = isoDateOnly();
  const tomorrow = addDaysIso(today, 1);
  if (isoDate === today) {
    return locale === "en" ? "Today" : "Сегодня";
  }
  if (isoDate === tomorrow) {
    return locale === "en" ? "Tomorrow" : "Завтра";
  }
  return d.toLocaleDateString(locale === "en" ? "en-US" : "ru-RU", {
    day: "numeric",
    month: "long",
  });
}

export function attachScheduleMeta(
  plan: WorkoutPlan,
  isoDate: string,
  locale: Locale,
): WorkoutPlan {
  const split = getSplitForDate(isoDate, locale);
  const dateLabel = formatDayLabel(isoDate, locale);
  const title = plan.splitDay ?? split.title;
  return {
    ...plan,
    targetMuscles: plan.targetMuscles?.length ? plan.targetMuscles : split.muscles,
    programType: plan.programType ?? "daily",
    splitDay: `${dateLabel} · ${title}`,
    notes: plan.notes
      ? `${dateLabel} · ${title} — ${plan.notes}`
      : `${dateLabel} · ${title}`,
  };
}

export interface ScheduleDayItem {
  date: string;
  dayLabel: string;
  focusTitle: string;
  muscles: string[];
  completed: boolean;
  hasWorkout: boolean;
  isToday: boolean;
  /** First exercise names for bot preview */
  previewExercises?: string[];
}

export function buildScheduleDays(
  locale: Locale,
  fromDate: string,
  count: number,
): Omit<ScheduleDayItem, "completed" | "hasWorkout">[] {
  const items: Omit<ScheduleDayItem, "completed" | "hasWorkout">[] = [];
  const today = isoDateOnly();
  for (let i = 0; i < count; i++) {
    const date = addDaysIso(fromDate, i);
    const split = getSplitForDate(date, locale);
    const dayNum = i + 1;
    items.push({
      date,
      dayLabel: formatDayLabel(date, locale),
      focusTitle:
        locale === "en"
          ? `Day ${dayNum} · ${split.titleEn}`
          : `День ${dayNum} · ${split.titleRu}`,
      muscles: split.muscles,
      isToday: date === today,
    });
  }
  return items;
}

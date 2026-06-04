import { getWorkoutResultsHistory } from "../database/workouts-repo.js";
import { getWorkoutStreak } from "./streak-service.js";
import { getPersonalRecords } from "./personal-records-service.js";
import { isoDateOnly } from "./schedule-service.js";

export interface WeeklyVolumePoint {
  weekStart: string;
  totalSets: number;
  totalVolumeKg: number;
  workoutsCompleted: number;
}

export interface PremiumInsights {
  currentStreak: number;
  volumeThisWeekKg: number;
  volumeLastWeekKg: number;
  volumeChangePercent: number | null;
  workoutsThisWeek: number;
  workoutsLastWeek: number;
  personalRecordsCount: number;
  topFocus: string | null;
  weeklyVolume: WeeklyVolumePoint[];
}

function weekBounds(offsetWeeks: number): { start: string; end: string } {
  const d = new Date();
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday + offsetWeeks * 7);
  const start = isoDateOnly(d);
  d.setDate(d.getDate() + 6);
  const end = isoDateOnly(d);
  return { start, end };
}

function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function exerciseVolumeKg(
  sets: number,
  reps: number[],
  weight: number | null,
): number {
  if (weight && weight > 0) {
    return weight * reps.reduce((a, b) => a + b, 0);
  }
  return 0;
}

export async function getPremiumInsights(telegramId: number): Promise<PremiumInsights> {
  const history = await getWorkoutResultsHistory(telegramId, 120);
  const thisW = weekBounds(0);
  const lastW = weekBounds(-1);

  let volumeThisWeekKg = 0;
  let volumeLastWeekKg = 0;
  let workoutsThisWeek = 0;
  let workoutsLastWeek = 0;
  const focusCount = new Map<string, number>();

  for (const day of history) {
    if (!day.completed) {
      continue;
    }
    let dayVol = 0;
    for (const ex of day.exercises) {
      dayVol += exerciseVolumeKg(ex.setsCompleted, ex.repsCompleted, ex.weightUsed);
    }
    if (inRange(day.workoutDate, thisW.start, thisW.end)) {
      volumeThisWeekKg += dayVol;
      workoutsThisWeek += 1;
    }
    if (inRange(day.workoutDate, lastW.start, lastW.end)) {
      volumeLastWeekKg += dayVol;
      workoutsLastWeek += 1;
    }
    const focus = day.focusTitle?.split("·").pop()?.trim() ?? day.focusTitle;
    if (focus && inRange(day.workoutDate, thisW.start, thisW.end)) {
      focusCount.set(focus, (focusCount.get(focus) ?? 0) + 1);
    }
  }

  volumeThisWeekKg = Math.round(volumeThisWeekKg);
  volumeLastWeekKg = Math.round(volumeLastWeekKg);

  let volumeChangePercent: number | null = null;
  if (volumeLastWeekKg > 0) {
    volumeChangePercent = Math.round(
      ((volumeThisWeekKg - volumeLastWeekKg) / volumeLastWeekKg) * 100,
    );
  }

  let topFocus: string | null = null;
  let topCount = 0;
  for (const [focus, count] of focusCount) {
    if (count > topCount) {
      topFocus = focus;
      topCount = count;
    }
  }

  const weeklyVolume: WeeklyVolumePoint[] = [];
  for (let w = -3; w <= 0; w += 1) {
    const bounds = weekBounds(w);
    let sets = 0;
    let vol = 0;
    let done = 0;
    for (const day of history) {
      if (!inRange(day.workoutDate, bounds.start, bounds.end) || !day.completed) {
        continue;
      }
      done += 1;
      for (const ex of day.exercises) {
        sets += ex.setsCompleted;
        vol += exerciseVolumeKg(ex.setsCompleted, ex.repsCompleted, ex.weightUsed);
      }
    }
    weeklyVolume.push({
      weekStart: bounds.start,
      totalSets: sets,
      totalVolumeKg: Math.round(vol),
      workoutsCompleted: done,
    });
  }

  const [streak, records] = await Promise.all([
    getWorkoutStreak(telegramId),
    getPersonalRecords(telegramId, 50),
  ]);

  return {
    currentStreak: streak,
    volumeThisWeekKg,
    volumeLastWeekKg,
    volumeChangePercent,
    workoutsThisWeek,
    workoutsLastWeek,
    personalRecordsCount: records.length,
    topFocus,
    weeklyVolume,
  };
}

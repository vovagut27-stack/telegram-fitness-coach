import type { WorkoutResultDay } from "../types";

export function buildWeekSummaryText(
  results: WorkoutResultDay[],
  locale: "ru" | "en",
): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const start = monday.toISOString().slice(0, 10);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const end = sunday.toISOString().slice(0, 10);

  const week = results.filter((d) => d.workoutDate >= start && d.workoutDate <= end && d.completed);
  const sets = week.reduce(
    (acc, d) => acc + d.exercises.reduce((s, e) => s + e.setsCompleted, 0),
    0,
  );
  const vol = week.reduce((acc, d) => {
    return (
      acc +
      d.exercises.reduce((s, e) => {
        const w = e.weightUsed ?? 0;
        const reps = e.repsCompleted.reduce((a, b) => a + b, 0);
        return s + w * reps;
      }, 0)
    );
  }, 0);

  if (locale === "ru") {
    return [
      "📊 FitBot — итоги недели",
      `${start} — ${end}`,
      `Тренировок: ${week.length}`,
      `Подходов: ${sets}`,
      vol > 0 ? `Объём: ~${Math.round(vol)} кг` : "",
      "",
      "💪 Продолжаем!",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "📊 FitBot — week summary",
    `${start} — ${end}`,
    `Workouts: ${week.length}`,
    `Sets: ${sets}`,
    vol > 0 ? `Volume: ~${Math.round(vol)} kg` : "",
    "",
    "💪 Keep going!",
  ]
    .filter(Boolean)
    .join("\n");
}

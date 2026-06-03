import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type {
  ExerciseLog,
  WorkoutExercise,
  WorkoutPlan,
  WorkoutResultDay,
  WorkoutResultExercise,
} from "../types";
import { useI18n } from "../i18n/context";
import {
  fetchPlanForDate,
  fetchWorkoutResults,
  saveManualWorkoutResults,
  type ResultsComparison,
} from "../services/api";
import { requireTelegramUserId } from "../services/telegram";

interface ManualRow {
  exerciseName: string;
  sets: number;
  repsPerSet: number;
  weightKg: string;
}

function defaultRows(exercises: WorkoutExercise[]): ManualRow[] {
  return exercises.map((ex) => ({
    exerciseName: ex.name,
    sets: ex.sets,
    repsPerSet: Number(ex.reps.split("-")[0]) || 10,
    weightKg: "",
  }));
}

function mergeWithExisting(plan: WorkoutPlan, day: WorkoutResultDay | undefined): ManualRow[] {
  const base = defaultRows(plan.exercises);
  if (!day?.exercises.length) {
    return base;
  }
  return base.map((row) => {
    const log = day.exercises.find(
      (e) => e.exerciseName.toLowerCase() === row.exerciseName.toLowerCase(),
    );
    if (!log) {
      return row;
    }
    return {
      exerciseName: row.exerciseName,
      sets: log.setsCompleted || row.sets,
      repsPerSet: log.repsCompleted[0] ?? row.repsPerSet,
      weightKg: log.weightUsed != null ? String(log.weightUsed) : "",
    };
  });
}

interface ResultsViewProps {
  onSaved?: () => void;
}

export function ResultsView({ onSaved }: ResultsViewProps): ReactElement {
  const { tr, locale } = useI18n();
  const [results, setResults] = useState<WorkoutResultDay[]>([]);
  const [comparison, setComparison] = useState<ResultsComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [rows, setRows] = useState<ManualRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWorkoutResults(requireTelegramUserId());
      setResults(data.results);
      setComparison(data.comparison);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr("load_error"));
    } finally {
      setLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadPlanForEntry = async (): Promise<void> => {
    setLoadingPlan(true);
    setError(null);
    try {
      const { plan: loaded } = await fetchPlanForDate(requireTelegramUserId(), entryDate);
      const existing = results.find((d) => d.workoutDate === entryDate);
      setPlan(loaded);
      setRows(mergeWithExisting(loaded, existing));
    } catch (err) {
      setError(err instanceof Error ? err.message : tr("load_error"));
    } finally {
      setLoadingPlan(false);
    }
  };

  const saveManual = async (): Promise<void> => {
    if (!plan || rows.length === 0) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const exercises: ExerciseLog[] = rows
        .filter((r) => r.sets > 0)
        .map((r) => ({
          exerciseName: r.exerciseName,
          setsCompleted: r.sets,
          repsCompleted: Array.from({ length: r.sets }, () => r.repsPerSet),
          weightUsed: r.weightKg ? Number(r.weightKg) : undefined,
        }));
      await saveManualWorkoutResults(
        requireTelegramUserId(),
        entryDate,
        exercises,
        locale === "ru" ? "Запись вручную" : "Manual entry",
      );
      await reload();
      onSaved?.();
      setPlan(null);
      setRows([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr("save_workout_error"));
    } finally {
      setSaving(false);
    }
  };

  const weightTrendLabel = (): string => {
    if (!comparison?.weightTrend) {
      return tr("weight_trend_none");
    }
    if (comparison.weightTrend === "down") {
      return tr("weight_trend_down", {
        kg: String(comparison.weightChangeKg ?? 0),
      });
    }
    if (comparison.weightTrend === "up") {
      return tr("weight_trend_up", {
        kg: String(comparison.weightChangeKg ?? 0),
      });
    }
    return tr("weight_trend_stable");
  };

  return (
    <div className="results-view">
      <section className="card">
        <h2>{tr("results_title")}</h2>
        <p className="muted">{tr("results_sub")}</p>
        {comparison ? (
          <div className="stats-grid">
            <article className="stat-pill">
              <strong>{comparison.completedThisWeek}</strong>
              <span className="muted">{tr("results_week_done")}</span>
              <span className="muted small">
                {tr("results_vs_last", { n: String(comparison.completedLastWeek) })}
              </span>
            </article>
            <article className="stat-pill">
              <strong>{comparison.totalSetsThisWeek}</strong>
              <span className="muted">{tr("results_sets_week")}</span>
              <span className="muted small">
                {tr("results_vs_last", { n: String(comparison.totalSetsLastWeek) })}
              </span>
            </article>
            <article className="stat-pill">
              <strong>
                {comparison.latestWeight != null
                  ? `${comparison.latestWeight} ${tr("kg_unit")}`
                  : "—"}
              </strong>
              <span className="muted">{tr("results_weight")}</span>
              <span className="muted small">{weightTrendLabel()}</span>
            </article>
          </div>
        ) : null}
      </section>

      <section className="card">
        <h3>{tr("results_manual_title")}</h3>
        <p className="muted">{tr("results_manual_hint")}</p>
        <label className="field">
          {tr("results_pick_date")}
          <input
            type="date"
            value={entryDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => {
              setEntryDate(e.target.value);
              setPlan(null);
              setRows([]);
            }}
          />
        </label>
        <button
          type="button"
          className="btn-secondary"
          disabled={loadingPlan}
          onClick={() => void loadPlanForEntry()}
        >
          {loadingPlan ? tr("loading") : tr("results_load_day")}
        </button>

        {plan && rows.length > 0 ? (
          <div className="manual-exercises">
            <p className="muted">
              {plan.splitDay ?? plan.targetMuscles.join(", ")} · {entryDate}
            </p>
            {rows.map((row, idx) => (
              <div key={row.exerciseName} className="manual-row">
                <strong>{row.exerciseName}</strong>
                <div className="row-3">
                  <label className="field compact">
                    {tr("results_sets")}
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={row.sets}
                      onChange={(e) => {
                        const sets = Number(e.target.value);
                        setRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, sets } : r)),
                        );
                      }}
                    />
                  </label>
                  <label className="field compact">
                    {tr("results_reps")}
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={row.repsPerSet}
                      onChange={(e) => {
                        const repsPerSet = Number(e.target.value);
                        setRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, repsPerSet } : r)),
                        );
                      }}
                    />
                  </label>
                  <label className="field compact">
                    {tr("results_weight_kg")}
                    <input
                      type="number"
                      min={0}
                      max={500}
                      step={0.5}
                      placeholder="—"
                      value={row.weightKg}
                      onChange={(e) => {
                        const weightKg = e.target.value;
                        setRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, weightKg } : r)),
                        );
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-primary"
              disabled={saving}
              onClick={() => void saveManual()}
            >
              {saving ? tr("loading") : tr("results_save")}
            </button>
          </div>
        ) : null}
      </section>

      <section className="card">
        <h3>{tr("results_history")}</h3>
        {loading ? <p className="muted">{tr("loading")}</p> : null}
        {!loading && results.length === 0 ? (
          <p className="muted">{tr("results_empty")}</p>
        ) : null}
        <ul className="results-list">
          {results.map((day) => {
            const open = expandedDate === day.workoutDate;
            const totalVol = day.exercises.reduce(
              (s: number, e: WorkoutResultExercise) =>
                s +
                e.setsCompleted *
                  (e.weightUsed ?? 0) *
                  (e.repsCompleted[0] ?? 1),
              0,
            );
            return (
              <li key={day.workoutDate} className="results-day">
                <button
                  type="button"
                  className="results-day-head"
                  onClick={() => setExpandedDate(open ? null : day.workoutDate)}
                >
                  <span>
                    {day.workoutDate}
                    {day.focusTitle ? ` · ${day.focusTitle}` : ""}
                  </span>
                  <span className="muted">
                    {day.completed ? "✓" : "○"} {day.exercises.length}{" "}
                    {tr("results_exercises_short")}
                    {totalVol > 0 ? ` · ${Math.round(totalVol)} ${tr("kg_unit")}` : ""}
                  </span>
                </button>
                {open ? (
                  <ul className="results-exercises">
                    {day.exercises.map((ex: WorkoutResultExercise) => (
                      <li key={ex.exerciseName}>
                        <strong>{ex.exerciseName}</strong>
                        <span className="muted">
                          {ex.setsCompleted}×
                          {ex.repsCompleted.length
                            ? ex.repsCompleted.join("/")
                            : "—"}
                          {ex.weightUsed != null ? ` · ${ex.weightUsed} ${tr("kg_unit")}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}

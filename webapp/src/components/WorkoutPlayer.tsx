import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { ExerciseLog, Gender, WorkoutPlan } from "../types";
import { ExerciseCard } from "./ExerciseCard";
import { Timer } from "./Timer";
import { useI18n } from "../i18n/context";
import { levelLabel } from "../i18n/levels";
import { effectiveRestSeconds } from "../utils/exerciseRest";
import { repTargetsPerSet } from "../utils/repTargets";

interface WorkoutPlayerProps {
  workout: WorkoutPlan;
  gender?: Gender | null;
  gymMode?: boolean;
  restPreset?: "short" | "normal" | "long";
  onBack?: () => void;
  onComplete: (logs: ExerciseLog[]) => Promise<void>;
  onGoHome?: () => void;
}

function buildLogsFromPlan(workout: WorkoutPlan): ExerciseLog[] {
  return workout.exercises.map((ex) => ({
    exerciseName: ex.name,
    setsCompleted: ex.sets,
    repsCompleted: repTargetsPerSet(ex.reps, ex.sets),
    durationSeconds: ex.sets * 45,
  }));
}

export function WorkoutPlayer({
  workout,
  gender,
  gymMode = false,
  restPreset = "normal",
  onBack,
  onComplete,
  onGoHome,
}: WorkoutPlayerProps): ReactElement {
  const { locale, tr } = useI18n();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setDone, setSetDone] = useState(0);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [repsInput, setRepsInput] = useState("");
  const [loggedReps, setLoggedReps] = useState<number[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const autoSaveStarted = useRef(false);

  const exercises = workout.exercises ?? [];
  const current = exercises[exerciseIndex];
  const restSeconds = current
    ? effectiveRestSeconds(current, workout.difficultyLevel, restPreset)
    : 60;
  const isLastExercise = exerciseIndex === exercises.length - 1;
  const completed = useMemo(
    () => exercises.length === 0 || exerciseIndex >= exercises.length,
    [exerciseIndex, exercises.length],
  );

  const repPlan = useMemo(
    () => (current ? repTargetsPerSet(current.reps, current.sets) : []),
    [current],
  );

  useEffect(() => {
    if (!current) {
      return;
    }
    const targets = repTargetsPerSet(current.reps, current.sets);
    setRepsInput(String(targets[0] ?? 10));
    setLoggedReps([]);
    setWeightInput(
      gymMode && current.weightKg != null ? String(current.weightKg) : "",
    );
    setSetDone(0);
  }, [exerciseIndex, current, gymMode]);

  useEffect(() => {
    if (!current || repPlan.length === 0) {
      return;
    }
    const target = repPlan[setDone] ?? repPlan[repPlan.length - 1];
    setRepsInput(String(target));
  }, [setDone, current, repPlan]);

  const finalLogs = useMemo(
    () => (logs.length > 0 ? logs : buildLogsFromPlan(workout)),
    [logs, workout],
  );

  const runSave = useCallback(() => {
    setSaveState("saving");
    return onComplete(finalLogs)
      .then(() => setSaveState("done"))
      .catch(() => setSaveState("error"));
  }, [finalLogs, onComplete]);

  useEffect(() => {
    if (!completed || autoSaveStarted.current) {
      return;
    }
    autoSaveStarted.current = true;
    void runSave();
  }, [completed, runSave]);

  const retrySave = (): void => {
    void runSave();
  };

  const markSetCompleted = (): void => {
    if (!current) {
      return;
    }
    const planned = repPlan[setDone] ?? 10;
    const actual = Math.max(1, Number(repsInput) || planned);
    const nextLogged = [...loggedReps, actual];
    setLoggedReps(nextLogged);

    const nextSet = setDone + 1;
    if (nextSet < current.sets) {
      setSetDone(nextSet);
      setIsResting(true);
      return;
    }

    const weight = weightInput.trim() ? Number(weightInput) : undefined;
    const entry: ExerciseLog = {
      exerciseName: current.name,
      setsCompleted: current.sets,
      repsCompleted: nextLogged,
      durationSeconds: current.sets * 45,
      weightUsed: weight,
    };
    setLogs((prev) => [...prev, entry]);

    if (isLastExercise) {
      setExerciseIndex(exercises.length);
      return;
    }

    setExerciseIndex((idx) => idx + 1);
    setSetDone(0);
    setLoggedReps([]);
  };

  if (exercises.length === 0) {
    return (
      <section className="card">
        <h2>{tr("workout_empty")}</h2>
        <p className="muted">{tr("workout_empty_hint")}</p>
        <button type="button" className="btn-primary" onClick={() => onGoHome?.()}>
          {tr("tab_home")}
        </button>
      </section>
    );
  }

  if (!current) {
    return (
      <section className="card">
        <p className="error">{tr("load_error")}</p>
        <button type="button" onClick={() => onGoHome?.()}>
          {tr("tab_home")}
        </button>
      </section>
    );
  }

  if (completed) {
    return (
      <section className="card">
        <h2>{tr("workout_complete")}</h2>
        {saveState === "saving" ? (
          <p className="muted">{tr("results_saving")}</p>
        ) : null}
        {saveState === "done" ? (
          <p className="ok">{tr("results_saved_auto")}</p>
        ) : null}
        {saveState === "error" ? (
          <>
            <p className="error">{tr("save_workout_error")}</p>
            <button type="button" className="btn-primary" onClick={retrySave}>
              {tr("save_session")}
            </button>
          </>
        ) : null}
        {saveState === "done" ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => (onGoHome ? onGoHome() : onBack?.())}
          >
            {tr("tab_home")}
          </button>
        ) : null}
        {saveState === "done" && gymMode && onBack ? (
          <button type="button" className="btn-secondary" onClick={onBack}>
            {tr("back")}
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section className={gymMode ? "workout-player gym" : "workout-player"}>
      <header>
        {onBack ? (
          <button type="button" className="link-back" onClick={onBack}>
            ← {tr("back")}
          </button>
        ) : null}
        <h2>{workout.splitDay ?? (gymMode ? tr("gym_title") : tr("workout_player"))}</h2>
        <p>
          {tr("focus")}: {(workout.targetMuscles ?? []).join(", ") || "—"} · {tr("time_min")}:{" "}
          {workout.totalMinutes} {tr("min")} · {levelLabel(locale, workout.difficultyLevel)}
        </p>
        {workout.notes ? <p className="muted">{workout.notes}</p> : null}
      </header>
      <ExerciseCard
        exercise={{ ...current, restSeconds }}
        index={exerciseIndex}
        gender={gender}
        gymMode={gymMode}
      />
      <p className="set-progress">
        {tr("set_progress", { current: setDone + 1, total: current.sets })}
      </p>
      <p className="set-target muted">
        {tr("player_set_target", {
          reps: repPlan[setDone] ?? repPlan[0] ?? 10,
        })}
      </p>
      <div className="row-2 log-inputs">
        <label className="field compact">
          {tr("player_reps_actual", { set: setDone + 1 })}
          <input
            type="number"
            min={1}
            max={100}
            value={repsInput}
            onChange={(e) => setRepsInput(e.target.value)}
          />
        </label>
        <label className="field compact">
          {gymMode ? tr("player_weight_kg") : tr("player_weight_optional")}
          <input
            type="number"
            min={0}
            max={500}
            step={0.5}
            placeholder="—"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
          />
        </label>
      </div>
      <p className="muted small">{tr("player_log_hint")}</p>
      {isResting ? (
        <Timer
          seconds={restSeconds}
          label={tr("rest")}
          onDone={() => {
            setIsResting(false);
          }}
        />
      ) : null}
      <button type="button" className="btn-primary" onClick={markSetCompleted}>
        {setDone + 1 >= current.sets ? tr("player_finish_exercise") : tr("mark_set")}
      </button>
    </section>
  );
}

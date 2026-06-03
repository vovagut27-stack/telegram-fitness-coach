import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { ExerciseLog, Gender, WorkoutPlan } from "../types";
import { ExerciseCard } from "./ExerciseCard";
import { Timer } from "./Timer";
import { useI18n } from "../i18n/context";
import { levelLabel } from "../i18n/levels";
import { effectiveRestSeconds } from "../utils/exerciseRest";

interface WorkoutPlayerProps {
  workout: WorkoutPlan;
  gender?: Gender | null;
  gymMode?: boolean;
  onBack?: () => void;
  onComplete: (logs: ExerciseLog[]) => Promise<void>;
}

function defaultReps(reps: string): number {
  return Number(reps.split("-")[0]) || 10;
}

function buildLogsFromPlan(workout: WorkoutPlan): ExerciseLog[] {
  return workout.exercises.map((ex) => ({
    exerciseName: ex.name,
    setsCompleted: ex.sets,
    repsCompleted: Array.from({ length: ex.sets }, () => defaultReps(ex.reps)),
    durationSeconds: ex.sets * 45,
  }));
}

export function WorkoutPlayer({
  workout,
  gender,
  gymMode = false,
  onBack,
  onComplete,
}: WorkoutPlayerProps): ReactElement {
  const { locale, tr } = useI18n();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setDone, setSetDone] = useState(0);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [repsInput, setRepsInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const autoSaveStarted = useRef(false);

  const current = workout.exercises[exerciseIndex];
  const restSeconds = effectiveRestSeconds(current, workout.difficultyLevel);
  const isLastExercise = exerciseIndex === workout.exercises.length - 1;
  const completed = useMemo(
    () => exerciseIndex >= workout.exercises.length,
    [exerciseIndex, workout.exercises.length],
  );

  useEffect(() => {
    setRepsInput(String(defaultReps(current.reps)));
    setWeightInput("");
    setSetDone(0);
  }, [exerciseIndex, current.reps]);

  const finalLogs = logs.length > 0 ? logs : buildLogsFromPlan(workout);

  useEffect(() => {
    if (!completed || autoSaveStarted.current) {
      return;
    }
    autoSaveStarted.current = true;
    setSaveState("saving");
    void onComplete(finalLogs)
      .then(() => setSaveState("done"))
      .catch(() => setSaveState("error"));
  }, [completed, finalLogs, onComplete]);

  const retrySave = (): void => {
    setSaveState("saving");
    void onComplete(finalLogs)
      .then(() => setSaveState("done"))
      .catch(() => setSaveState("error"));
  };

  const finishExercise = (): void => {
    const reps = Math.max(1, Number(repsInput) || defaultReps(current.reps));
    const weight = weightInput.trim() ? Number(weightInput) : undefined;
    const entry: ExerciseLog = {
      exerciseName: current.name,
      setsCompleted: current.sets,
      repsCompleted: Array.from({ length: current.sets }, () => reps),
      durationSeconds: current.sets * 45,
      weightUsed: weight,
    };

    setLogs((prev) => [...prev, entry]);

    if (isLastExercise) {
      setExerciseIndex(workout.exercises.length);
      return;
    }

    setExerciseIndex((idx) => idx + 1);
    setSetDone(0);
  };

  const markSetCompleted = (): void => {
    const nextSet = setDone + 1;
    if (nextSet < current.sets) {
      setSetDone(nextSet);
      setIsResting(true);
      return;
    }
    finishExercise();
  };

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
          {tr("focus")}: {workout.targetMuscles.join(", ")} · {tr("time_min")}:{" "}
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
      <div className="row-2 log-inputs">
        <label className="field compact">
          {tr("player_reps")}
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

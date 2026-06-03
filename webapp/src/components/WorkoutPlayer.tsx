import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { ExerciseLog, Gender, WorkoutPlan } from "../types";
import { ExerciseCard } from "./ExerciseCard";
import { Timer } from "./Timer";
import { useI18n } from "../i18n/context";
import { levelLabel } from "../i18n/levels";

interface WorkoutPlayerProps {
  workout: WorkoutPlan;
  gender?: Gender | null;
  onComplete: (logs: ExerciseLog[]) => Promise<void>;
}

export function WorkoutPlayer({ workout, gender, onComplete }: WorkoutPlayerProps): ReactElement {
  const { locale, tr } = useI18n();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setDone, setSetDone] = useState(0);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [isResting, setIsResting] = useState(false);

  const current = workout.exercises[exerciseIndex];
  const isLastExercise = exerciseIndex === workout.exercises.length - 1;
  const completed = useMemo(
    () => exerciseIndex >= workout.exercises.length,
    [exerciseIndex, workout.exercises.length],
  );

  if (completed) {
    return (
      <section>
        <h2>{tr("workout_complete")}</h2>
        <button type="button" onClick={() => void onComplete(logs)}>
          {tr("save_session")}
        </button>
      </section>
    );
  }

  const markSetCompleted = (): void => {
    const nextSet = setDone + 1;
    if (nextSet < current.sets) {
      setSetDone(nextSet);
      setIsResting(true);
      return;
    }

    setLogs((prev) => [
      ...prev,
      {
        exerciseName: current.name,
        setsCompleted: current.sets,
        repsCompleted: Array.from({ length: current.sets }, () => Number(current.reps.split("-")[0])),
        durationSeconds: current.sets * 45,
      },
    ]);

    if (isLastExercise) {
      setExerciseIndex(workout.exercises.length);
      return;
    }

    setExerciseIndex((idx) => idx + 1);
    setSetDone(0);
  };

  return (
    <section>
      <header>
        <h2>{workout.splitDay ?? tr("workout_player")}</h2>
        <p>
          {tr("focus")}: {workout.targetMuscles.join(", ")} | {tr("time_min")}: {workout.totalMinutes}{" "}
          {tr("min")} | {levelLabel(locale, workout.difficultyLevel)}
        </p>
        {workout.notes ? <p className="muted">{workout.notes}</p> : null}
      </header>
      <ExerciseCard exercise={current} index={exerciseIndex} gender={gender} />
      <p>{tr("set_progress", { current: setDone + 1, total: current.sets })}</p>
      {isResting ? (
        <Timer
          seconds={current.restSeconds}
          label={tr("rest")}
          onDone={() => {
            setIsResting(false);
          }}
        />
      ) : null}
      <button type="button" onClick={markSetCompleted}>
        {tr("mark_set")}
      </button>
    </section>
  );
}

import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { ExerciseLog, WorkoutPlan } from "../types";
import { ExerciseCard } from "./ExerciseCard";
import { Timer } from "./Timer";

interface WorkoutPlayerProps {
  workout: WorkoutPlan;
  onComplete: (logs: ExerciseLog[]) => Promise<void>;
}

export function WorkoutPlayer({ workout, onComplete }: WorkoutPlayerProps): ReactElement {
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
        <h2>Workout Complete</h2>
        <button type="button" onClick={() => void onComplete(logs)}>
          Save Session
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
        <h2>Workout Player</h2>
        <p>
          Focus: {workout.targetMuscles.join(", ")} | Time: {workout.totalMinutes} min
        </p>
      </header>
      <ExerciseCard exercise={current} index={exerciseIndex} />
      <p>
        Set {setDone + 1} / {current.sets}
      </p>
      {isResting ? (
        <Timer
          seconds={current.restSeconds}
          label="Rest"
          onDone={() => {
            setIsResting(false);
          }}
        />
      ) : null}
      <button type="button" onClick={markSetCompleted}>
        Mark Set Complete
      </button>
    </section>
  );
}

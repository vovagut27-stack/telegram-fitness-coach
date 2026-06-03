import type { ReactElement } from "react";
import type { WorkoutExercise } from "../types";
import { useI18n } from "../i18n/context";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
}

export function ExerciseCard({ exercise, index }: ExerciseCardProps): ReactElement {
  const { tr } = useI18n();
  const equipment =
    exercise.equipment === "none" ? tr("equipment_none") : exercise.equipment;

  return (
    <article className="exercise-card">
      <h3>
        {index + 1}. {exercise.name}
      </h3>
      <p>{tr("sets_reps", { sets: exercise.sets, reps: exercise.reps })}</p>
      <p>{tr("rest_seconds", { seconds: exercise.restSeconds })}</p>
      <p>
        {tr("equipment")}: {equipment}
      </p>
      <p>{exercise.instructions}</p>
      {exercise.demoUrl ? (
        <a href={exercise.demoUrl} target="_blank" rel="noreferrer">
          {tr("demo")}
        </a>
      ) : null}
    </article>
  );
}

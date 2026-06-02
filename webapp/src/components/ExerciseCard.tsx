import type { ReactElement } from "react";
import type { WorkoutExercise } from "../types";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
}

export function ExerciseCard({ exercise, index }: ExerciseCardProps): ReactElement {
  return (
    <article className="exercise-card">
      <h3>
        {index + 1}. {exercise.name}
      </h3>
      <p>
        {exercise.sets} sets x {exercise.reps} reps
      </p>
      <p>Rest: {exercise.restSeconds}s</p>
      <p>Equipment: {exercise.equipment}</p>
      <p>{exercise.instructions}</p>
      {exercise.demoUrl ? (
        <a href={exercise.demoUrl} target="_blank" rel="noreferrer">
          Demo
        </a>
      ) : null}
    </article>
  );
}

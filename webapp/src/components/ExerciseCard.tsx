import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { WorkoutExercise } from "../types";
import { useI18n } from "../i18n/context";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
}

export function ExerciseCard({ exercise, index }: ExerciseCardProps): ReactElement {
  const { tr } = useI18n();
  const [imgSrc, setImgSrc] = useState(exercise.demoUrl ?? FALLBACK_IMG);

  useEffect(() => {
    setImgSrc(exercise.demoUrl ?? FALLBACK_IMG);
  }, [exercise.name, exercise.demoUrl]);

  const equipment =
    exercise.equipment === "none" ? tr("equipment_none") : exercise.equipment;

  return (
    <article className="exercise-card">
      <img
        className="exercise-img"
        src={imgSrc}
        alt={exercise.name}
        loading="lazy"
        onError={() => setImgSrc(FALLBACK_IMG)}
      />
      <h3>
        {index + 1}. {exercise.name}
      </h3>
      <p>{tr("sets_reps", { sets: exercise.sets, reps: exercise.reps })}</p>
      <p>{tr("rest_seconds", { seconds: exercise.restSeconds })}</p>
      <p>
        {tr("equipment")}: {equipment}
      </p>
      <p>{exercise.instructions}</p>
    </article>
  );
}

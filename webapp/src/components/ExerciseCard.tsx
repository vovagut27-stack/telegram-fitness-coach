import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { Gender, WorkoutExercise } from "../types";
import { useI18n } from "../i18n/context";
import { equipmentIcon, equipmentMessageKey } from "../utils/equipment";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
  gender?: Gender | null;
  gymMode?: boolean;
}

export function ExerciseCard({
  exercise,
  index,
  gender,
  gymMode = false,
}: ExerciseCardProps): ReactElement {
  const { tr } = useI18n();
  const [imgSrc, setImgSrc] = useState(exercise.demoUrl ?? FALLBACK_IMG);

  useEffect(() => {
    setImgSrc(exercise.demoUrl ?? FALLBACK_IMG);
  }, [exercise.name, exercise.demoUrl, gender]);

  const eqKey = equipmentMessageKey(exercise.equipment);
  const eqLabel = tr(eqKey);
  const icon = equipmentIcon(exercise.equipment);

  return (
    <article className={`exercise-card ${gymMode ? "gym-mode" : ""}`}>
      <img
        className="exercise-img"
        src={imgSrc}
        alt={exercise.name}
        loading="lazy"
        onError={() => setImgSrc(FALLBACK_IMG)}
      />
      {gymMode ? (
        <p className="equipment-pill gym">
          {icon} {eqLabel}
        </p>
      ) : null}
      <h3>
        {index + 1}. {exercise.name}
      </h3>
      <p>{tr("sets_reps", { sets: exercise.sets, reps: exercise.reps })}</p>
      <p>{tr("rest_seconds", { seconds: exercise.restSeconds })}</p>
      {!gymMode ? (
        <p>
          {tr("equipment")}: {eqLabel}
        </p>
      ) : null}
      <p>{exercise.instructions}</p>
    </article>
  );
}

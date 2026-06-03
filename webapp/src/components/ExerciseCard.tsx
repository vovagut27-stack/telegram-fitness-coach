import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { Gender, WorkoutExercise } from "../types";
import { useI18n } from "../i18n/context";
import { equipmentIcon, equipmentMessageKey } from "../utils/equipment";
import {
  resolveExerciseImageFallback,
  resolveExerciseImageSrc,
} from "../utils/exerciseImage";

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
  const primarySrc = resolveExerciseImageSrc(exercise, gender);
  const movementFallback = resolveExerciseImageFallback(exercise, gender);
  const [imgSrc, setImgSrc] = useState(primarySrc);
  const [usedMovementFallback, setUsedMovementFallback] = useState(false);

  useEffect(() => {
    setImgSrc(resolveExerciseImageSrc(exercise, gender));
    setUsedMovementFallback(false);
  }, [exercise.name, exercise.demoUrl, exercise.equipment, gender]);

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
        onError={() => {
          if (!usedMovementFallback) {
            setUsedMovementFallback(true);
            setImgSrc(movementFallback);
            return;
          }
          setImgSrc(movementFallback);
        }}
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

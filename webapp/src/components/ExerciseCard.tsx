import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { Gender, WorkoutExercise } from "../types";
import { useI18n } from "../i18n/context";
import { equipmentIcon, equipmentMessageKey } from "../utils/equipment";

const FALLBACK_IMGS = [
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
];

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
  const fallbackForIndex = FALLBACK_IMGS[index % FALLBACK_IMGS.length];
  const [imgSrc, setImgSrc] = useState(exercise.demoUrl ?? fallbackForIndex);
  const [fallbackStep, setFallbackStep] = useState(0);

  useEffect(() => {
    setImgSrc(exercise.demoUrl ?? fallbackForIndex);
    setFallbackStep(0);
  }, [exercise.name, exercise.demoUrl, gender, fallbackForIndex]);

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
          const next = fallbackStep + 1;
          setFallbackStep(next);
          setImgSrc(FALLBACK_IMGS[next % FALLBACK_IMGS.length]);
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

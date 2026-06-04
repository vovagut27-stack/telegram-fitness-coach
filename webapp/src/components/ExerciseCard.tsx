import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { Gender, WorkoutExercise } from "../types";
import { useI18n } from "../i18n/context";
import { equipmentIcon, equipmentMessageKey } from "../utils/equipment";
import { exerciseImageCandidates } from "../utils/exerciseImage";
import { repTargetsPerSet } from "../utils/repTargets";

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
  const candidates = useMemo(
    () => exerciseImageCandidates(exercise, gender),
    [exercise.name, exercise.demoUrl, exercise.imageFallback, exercise.equipment, gender, exercise.instructions],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);
  const imgSrc =
    candidates[candidateIndex] ??
    candidates[0] ??
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
  const isIllustration = /\.svg(\?|$)/i.test(imgSrc);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  const repPlan = useMemo(
    () => repTargetsPerSet(exercise.reps, exercise.sets),
    [exercise.reps, exercise.sets],
  );

  const eqKey = equipmentMessageKey(exercise.equipment);
  const eqLabel = tr(eqKey);
  const icon = equipmentIcon(exercise.equipment);

  return (
    <article className={`exercise-card ${gymMode ? "gym-mode" : ""}`}>
      <img
        className={`exercise-img ${isIllustration ? "" : "exercise-img-photo"}`}
        src={imgSrc}
        alt={exercise.name}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          setCandidateIndex((i) => {
            if (i + 1 < candidates.length) {
              return i + 1;
            }
            return i;
          });
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
      <p className="sets-summary">
        {tr("sets_count", { sets: exercise.sets })} · {tr("rest_seconds", { seconds: exercise.restSeconds })}
      </p>
      <ul className="set-rep-plan">
        {repPlan.map((target, setIndex) => (
          <li key={setIndex}>
            {tr("set_rep_line", { set: setIndex + 1, reps: target })}
          </li>
        ))}
      </ul>
      {!gymMode ? (
        <p>
          {tr("equipment")}: {eqLabel}
        </p>
      ) : null}
      <p>{exercise.instructions}</p>
    </article>
  );
}

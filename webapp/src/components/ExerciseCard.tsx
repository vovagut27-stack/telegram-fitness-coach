import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { Gender, WorkoutExercise } from "../types";
import { useI18n } from "../i18n/context";
import { equipmentIcon, equipmentMessageKey } from "../utils/equipment";
import { exerciseImageCandidates } from "../utils/exerciseImage";
import { resolveLocalExerciseAsset } from "../utils/exerciseIllustration";
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
  const rawSrc =
    candidates[candidateIndex] ??
    candidates[0] ??
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
  const imgSrc = resolveLocalExerciseAsset(rawSrc);
  const isIllustration = /\.svg(\?|$)/i.test(imgSrc);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  const repPlan = useMemo(
    () => repTargetsPerSet(exercise.reps, exercise.sets),
    [exercise.reps, exercise.sets],
  );
  const isTimed = /сек|sec/i.test(exercise.reps);
  const repsLabel = exercise.reps.replace(/\s*сек.*$/i, "").replace(/\s*sec.*$/i, "").trim();

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
      {gymMode && exercise.weightKg != null ? (
        <p className="gym-scheme">
          {tr("gym_exercise_scheme", {
            sets: exercise.sets,
            weight: exercise.weightKg,
            reps: exercise.reps.replace(/[^\d]/g, "") || exercise.reps,
          })}
        </p>
      ) : (
        <>
          <p className="home-scheme">
            {isTimed
              ? tr("home_exercise_scheme_time", {
                  sets: exercise.sets,
                  seconds: repsLabel,
                })
              : tr("home_exercise_scheme", {
                  sets: exercise.sets,
                  reps: repsLabel,
                })}
          </p>
          <p className="sets-summary muted">
            {tr("rest_seconds", { seconds: exercise.restSeconds })}
          </p>
          {exercise.sets > 1 ? (
            <ul className="set-rep-plan">
              {repPlan.map((target, setIndex) => (
                <li key={setIndex}>
                  {isTimed
                    ? tr("set_time_line", { set: setIndex + 1, seconds: target })
                    : tr("set_rep_line", { set: setIndex + 1, reps: target })}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
      {!gymMode ? (
        <p>
          {tr("equipment")}: {eqLabel}
        </p>
      ) : null}
      <p>{exercise.instructions}</p>
    </article>
  );
}

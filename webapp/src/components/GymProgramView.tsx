import { useState } from "react";
import type { ReactElement } from "react";
import type { Gender, GymProgram, WorkoutPlan } from "../types";
import { useI18n } from "../i18n/context";
import { levelLabel } from "../i18n/levels";
import { WorkoutPlayer } from "./WorkoutPlayer";

interface GymProgramViewProps {
  program: GymProgram;
  todayIndex: number;
  gender?: Gender | null;
}

export function GymProgramView({
  program,
  todayIndex,
  gender,
}: GymProgramViewProps): ReactElement {
  const { locale, tr } = useI18n();
  const [active, setActive] = useState<{ plan: WorkoutPlan; label: string } | null>(null);

  if (active) {
    return (
      <WorkoutPlayer
        workout={active.plan}
        gender={gender}
        gymMode
        onBack={() => setActive(null)}
        onComplete={async () => {
          setActive(null);
        }}
      />
    );
  }

  return (
    <section className="gym-program">
      <header className="hero-banner gym">
        <h2>{program.title}</h2>
        <p>{program.subtitle}</p>
      </header>
      <p className="muted">{tr("gym_pick_day")}</p>
      <div className="day-grid">
        {program.days.map((day, i) => (
          <article
            key={day.dayKey}
            className={`day-card ${i === todayIndex ? "today" : ""}`}
          >
            <h3>{day.dayLabel}</h3>
            <p className="focus">{day.focus}</p>
            <p className="muted">
              {tr("exercises_count", { n: day.plan.exercises.length })} ·{" "}
              {levelLabel(locale, day.plan.difficultyLevel)}
            </p>
            <ul className="gym-preview-list">
              {day.plan.exercises.map((ex) => (
                <li key={ex.name}>
                  {ex.name} — {ex.sets}×{ex.reps}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setActive({ plan: day.plan, label: day.dayLabel })}
            >
              {i === todayIndex ? tr("gym_start_today") : tr("gym_start_day")}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

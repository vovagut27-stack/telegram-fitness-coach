import type { ReactElement } from "react";
import type { GymProgram } from "../types";
import { useI18n } from "../i18n/context";
import { levelLabel } from "../i18n/levels";

interface GymProgramViewProps {
  program: GymProgram;
  todayIndex: number;
}

export function GymProgramView({ program, todayIndex }: GymProgramViewProps): ReactElement {
  const { locale, tr } = useI18n();

  return (
    <section className="gym-program">
      <header className="hero-banner gym">
        <h2>{program.title}</h2>
        <p>{program.subtitle}</p>
      </header>
      <p className="muted">{tr("gym_today")}</p>
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
            <ul>
              {day.plan.exercises.slice(0, 4).map((ex) => (
                <li key={ex.name}>
                  {ex.name} — {ex.sets}×{ex.reps}
                </li>
              ))}
              {day.plan.exercises.length > 4 ? <li>…</li> : null}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

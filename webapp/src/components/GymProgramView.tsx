import { useState } from "react";
import type { ReactElement } from "react";
import type { ExerciseLog, Gender, GymProgram, WorkoutPlan } from "../types";
import type { ScheduleDayItem } from "../services/api";
import { fetchGymWorkoutByDate } from "../services/api";
import { requireTelegramUserId } from "../services/telegram";
import { useI18n } from "../i18n/context";
import { levelLabel } from "../i18n/levels";
import { WorkoutPlayer } from "./WorkoutPlayer";
import { ScheduleList } from "./ScheduleList";

interface GymProgramViewProps {
  program: GymProgram;
  schedule: ScheduleDayItem[];
  gender?: Gender | null;
  onScheduleRefresh: () => void;
  onCompleteWorkout: (logs: ExerciseLog[], date: string) => Promise<void>;
}

export function GymProgramView({
  program,
  schedule,
  gender,
  onScheduleRefresh,
  onCompleteWorkout,
}: GymProgramViewProps): ReactElement {
  const { locale, tr } = useI18n();
  const [active, setActive] = useState<{
    plan: WorkoutPlan;
    date: string;
    completed: boolean;
  } | null>(null);
  const [loadingDate, setLoadingDate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDate = async (date: string): Promise<void> => {
    setLoadingDate(true);
    setError(null);
    try {
      const data = await fetchGymWorkoutByDate(requireTelegramUserId(), date);
      setActive({ plan: data.plan, date: data.date, completed: data.completed });
    } catch (err) {
      setError(err instanceof Error ? err.message : tr("load_error"));
    } finally {
      setLoadingDate(false);
    }
  };

  if (active) {
    if (active.completed) {
      return (
        <section className="card">
          <h2>✅ {tr("day_done")}</h2>
          <p className="muted">{active.date}</p>
          <button type="button" onClick={() => setActive(null)}>
            {tr("back")}
          </button>
        </section>
      );
    }

    return (
      <WorkoutPlayer
        workout={active.plan}
        gender={gender}
        gymMode
        onBack={() => setActive(null)}
        onComplete={async (logs) => {
          await onCompleteWorkout(logs, active.date);
          onScheduleRefresh();
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

      <ScheduleList days={schedule} selectedDate={null} onSelect={(date) => void openDate(date)} />
      {loadingDate ? <p className="muted center">{tr("loading")}</p> : null}
      {error ? <p className="error center">{error}</p> : null}

      <details className="card gym-template-overview">
        <summary>{tr("gym_template_title")}</summary>
        <p className="muted">{tr("gym_template_hint")}</p>
        <div className="day-grid compact">
          {program.days.map((day) => (
            <article key={day.dayKey} className="day-card">
              <h3>{day.dayLabel}</h3>
              <p className="focus">{day.focus}</p>
              <p className="muted">
                {tr("exercises_count", { n: day.plan.exercises.length })} ·{" "}
                {levelLabel(locale, day.plan.difficultyLevel)}
              </p>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}

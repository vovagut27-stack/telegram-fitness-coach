import type { ReactElement } from "react";
import type { ScheduleDayItem } from "../services/api";
import { useI18n } from "../i18n/context";

interface ScheduleListProps {
  days: ScheduleDayItem[];
  title?: string;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

export function ScheduleList({
  days,
  title,
  selectedDate,
  onSelect,
}: ScheduleListProps): ReactElement {
  const { tr } = useI18n();

  return (
    <section className="schedule-list">
      <h2>{title ?? tr("schedule_title")}</h2>
      <p className="muted">{tr("schedule_hint")}</p>
      {days.map((day) => (
        <button
          key={day.date}
          type="button"
          className={`schedule-day ${selectedDate === day.date ? "selected" : ""} ${day.isToday ? "today" : ""} ${day.completed ? "done" : ""}`}
          onClick={() => onSelect(day.date)}
        >
          <div className="schedule-day-top">
            <strong>{day.dayLabel}</strong>
            <span className="schedule-date">{day.date}</span>
          </div>
          <div className="focus">{day.focusTitle}</div>
          <div className="schedule-meta">
            {day.completed ? tr("day_done") : day.hasWorkout ? tr("day_ready") : tr("day_new")}
          </div>
        </button>
      ))}
    </section>
  );
}

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { UserProfile } from "../types";
import { useI18n } from "../i18n/context";
import { saveUserSettings } from "../services/api";
import { requireTelegramUserId } from "../services/telegram";

const TZ_PRESETS: { labelKey: "tz_msk" | "tz_utc" | "tz_kyiv"; minutes: number }[] = [
  { labelKey: "tz_msk", minutes: 180 },
  { labelKey: "tz_utc", minutes: 0 },
  { labelKey: "tz_kyiv", minutes: 120 },
];

interface ReminderSettingsProps {
  profile: UserProfile;
  onSaved: (p: UserProfile) => void;
}

export function ReminderSettings({ profile, onSaved }: ReminderSettingsProps): ReactElement {
  const { tr } = useI18n();
  const [enabled, setEnabled] = useState(Boolean(profile.remindersEnabled));
  const [hour, setHour] = useState(profile.reminderHour ?? 9);
  const [offset, setOffset] = useState(profile.timezoneOffsetMinutes ?? 180);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(Boolean(profile.remindersEnabled));
    setHour(profile.reminderHour ?? 9);
    setOffset(profile.timezoneOffsetMinutes ?? 180);
  }, [profile]);

  const save = async (): Promise<void> => {
    setSaving(true);
    setMsg(null);
    try {
      const saved = await saveUserSettings(requireTelegramUserId(), {
        remindersEnabled: enabled,
        reminderHour: hour,
        timezoneOffsetMinutes: offset,
      });
      onSaved(saved);
      setMsg(tr("saved"));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : tr("load_error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card inset reminder-settings">
      <h3>{tr("reminders_title")}</h3>
      <p className="muted small">{tr("reminders_sub")}</p>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        {tr("reminders_enable")}
      </label>

      <label className="field">
        {tr("reminders_hour")}
        <select value={hour} disabled={!enabled} onChange={(e) => setHour(Number(e.target.value))}>
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, "0")}:00
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        {tr("reminders_timezone")}
        <select
          value={offset}
          disabled={!enabled}
          onChange={(e) => setOffset(Number(e.target.value))}
        >
          {TZ_PRESETS.map((p) => (
            <option key={p.minutes} value={p.minutes}>
              {tr(p.labelKey)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="btn-secondary"
        disabled={saving}
        onClick={() => void save()}
      >
        {saving ? tr("loading") : tr("reminders_save")}
      </button>
      {msg ? <p className="ok">{msg}</p> : null}
    </section>
  );
}

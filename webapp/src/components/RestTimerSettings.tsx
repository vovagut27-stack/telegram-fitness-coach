import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { UserProfile } from "../types";
import { useI18n } from "../i18n/context";
import { saveUserSettings } from "../services/api";
import { requireTelegramUserId } from "../services/telegram";

type RestPreset = "short" | "normal" | "long";

interface RestTimerSettingsProps {
  profile: UserProfile;
  onSaved: (p: UserProfile) => void;
}

export function RestTimerSettings({ profile, onSaved }: RestTimerSettingsProps): ReactElement {
  const { tr } = useI18n();
  const [preset, setPreset] = useState<RestPreset>(profile.restPreset ?? "normal");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setPreset(profile.restPreset ?? "normal");
  }, [profile.restPreset]);

  if (!profile.isPremium) {
    return (
      <section className="card inset locked-feature">
        <h3>{tr("rest_preset_title")}</h3>
        <p className="muted">{tr("rest_preset_premium")}</p>
      </section>
    );
  }

  const save = async (): Promise<void> => {
    setSaving(true);
    setMsg(null);
    try {
      const saved = await saveUserSettings(requireTelegramUserId(), { restPreset: preset });
      onSaved(saved);
      setMsg(tr("saved"));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : tr("load_error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card inset">
      <h3>{tr("rest_preset_title")}</h3>
      <p className="muted small">{tr("rest_preset_sub")}</p>
      <div className="filter-tabs">
        {(["short", "normal", "long"] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={preset === key ? "active" : ""}
            onClick={() => setPreset(key)}
          >
            {tr(
              key === "short"
                ? "rest_preset_short"
                : key === "long"
                  ? "rest_preset_long"
                  : "rest_preset_normal",
            )}
          </button>
        ))}
      </div>
      <button type="button" className="btn-secondary" disabled={saving} onClick={() => void save()}>
        {saving ? tr("loading") : tr("save")}
      </button>
      {msg ? <p className="ok">{msg}</p> : null}
    </section>
  );
}

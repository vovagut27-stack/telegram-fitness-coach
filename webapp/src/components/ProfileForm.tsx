import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { FitnessLevel, Gender, UserProfile } from "../types";
import { useI18n } from "../i18n/context";
import { fetchProfile, saveProfile } from "../services/api";
import { requireTelegramUserId } from "../services/telegram";

interface ProfileFormProps {
  profile: UserProfile;
  onSaved: (p: UserProfile) => void;
}

export function ProfileForm({ profile, onSaved }: ProfileFormProps): ReactElement {
  const { tr, locale, setLocale } = useI18n();
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const submit = async (): Promise<void> => {
    setSaving(true);
    setMsg(null);
    setIsError(false);
    const telegramId = requireTelegramUserId();

    if (!form.gender) {
      setIsError(true);
      setMsg(tr("profile_need_gender"));
      setSaving(false);
      return;
    }

    try {
      await saveProfile({
        telegramId,
        gender: form.gender,
        age: form.age ?? undefined,
        weightKg: form.weightKg ?? undefined,
        heightCm: form.heightCm ?? undefined,
        fitnessLevel: form.fitnessLevel,
        language: locale,
        timePerSession: form.timePerSession ?? 45,
      });
      const saved = await fetchProfile(telegramId);
      setForm(saved);
      onSaved(saved);
      setMsg(tr("saved"));
    } catch (err) {
      setIsError(true);
      const detail = err instanceof Error ? err.message : "";
      setMsg(detail ? `${tr("load_error")}: ${detail}` : tr("load_error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card profile-card">
      <h2>{tr("profile_title")}</h2>
      <p className="muted">{tr("profile_sub")}</p>
      <p className="muted">{tr("profile_home_only")}</p>

      <label className="field">
        {tr("lang_label")}
        <select
          value={locale}
          onChange={(e) => void setLocale(e.target.value as "ru" | "en")}
        >
          <option value="ru">{tr("lang_ru")}</option>
          <option value="en">{tr("lang_en")}</option>
        </select>
      </label>

      <label className="field">
        {tr("gender")} *
        <select
          value={form.gender ?? ""}
          onChange={(e) =>
            setForm({ ...form, gender: (e.target.value || null) as Gender | null })
          }
        >
          <option value="">—</option>
          <option value="male">{tr("gender_male")}</option>
          <option value="female">{tr("gender_female")}</option>
          <option value="other">{tr("gender_other")}</option>
        </select>
      </label>

      <div className="row-2">
        <label className="field">
          {tr("age")}
          <input
            type="number"
            min={14}
            max={90}
            value={form.age ?? ""}
            onChange={(e) =>
              setForm({ ...form, age: e.target.value ? Number(e.target.value) : null })
            }
          />
        </label>
        <label className="field">
          {tr("weight")}
          <input
            type="number"
            min={35}
            max={250}
            value={form.weightKg ?? ""}
            onChange={(e) =>
              setForm({ ...form, weightKg: e.target.value ? Number(e.target.value) : null })
            }
          />
        </label>
      </div>

      <label className="field">
        {tr("height")}
        <input
          type="number"
          min={120}
          max={230}
          value={form.heightCm ?? ""}
          onChange={(e) =>
            setForm({ ...form, heightCm: e.target.value ? Number(e.target.value) : null })
          }
        />
      </label>

      {form.bmi ? (
        <p className="badge">
          {tr("bmi_label")}: {form.bmi}
        </p>
      ) : null}

      <label className="field">
        {tr("level")}
        <select
          value={form.fitnessLevel}
          onChange={(e) =>
            setForm({ ...form, fitnessLevel: e.target.value as FitnessLevel })
          }
        >
          <option value="beginner">{tr("level_beginner")}</option>
          <option value="intermediate">{tr("level_intermediate")}</option>
          <option value="advanced">{tr("level_advanced")}</option>
        </select>
      </label>

      {!form.profileComplete ? (
        <p className="warn">{tr("complete_profile")}</p>
      ) : (
        <p className="ok">✓ {tr("profile_complete_ok")}</p>
      )}

      <button type="button" className="btn-primary" disabled={saving} onClick={() => void submit()}>
        {saving ? tr("loading") : tr("save")}
      </button>
      {msg ? <p className={isError ? "error" : "ok"}>{msg}</p> : null}
    </section>
  );
}

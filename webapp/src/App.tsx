import { useCallback, useEffect, useState } from "react";
import { WorkoutPlayer } from "./components/WorkoutPlayer";
import { ProfileForm } from "./components/ProfileForm";
import { GymProgramView } from "./components/GymProgramView";
import { PremiumPanel } from "./components/PremiumPanel";
import { ScheduleList } from "./components/ScheduleList";
import { getTelegramUserId, getWorkoutDateFromUrl, initTelegramWebApp } from "./services/telegram";
import {
  completeWorkout,
  fetchGymProgram,
  fetchProfile,
  fetchSchedule,
  fetchWorkoutByDate,
  type ScheduleDayItem,
} from "./services/api";
import type { ExerciseLog, GymProgram, TabId, UserProfile, WorkoutPlan } from "./types";
import { useI18n } from "./i18n/context";
import { levelLabel } from "./i18n/levels";

function todayGymIndex(): number {
  return new Date().getDay() % 4;
}

function App() {
  const { tr, locale } = useI18n();
  const [tab, setTab] = useState<TabId>("home");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [schedule, setSchedule] = useState<ScheduleDayItem[]>([]);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [workoutDate, setWorkoutDate] = useState<string | null>(null);
  const [gym, setGym] = useState<GymProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const p = await fetchProfile(getTelegramUserId());
    setProfile(p);
    return p;
  }, []);

  const loadSchedule = useCallback(async () => {
    const days = await fetchSchedule(getTelegramUserId(), 7);
    setSchedule(days);
    return days;
  }, []);

  useEffect(() => {
    initTelegramWebApp();
    Promise.all([loadProfile(), loadSchedule()])
      .catch(() => setError(tr("network_error")))
      .finally(() => setLoading(false));
  }, [loadProfile, loadSchedule, tr]);

  useEffect(() => {
    const preset = getWorkoutDateFromUrl();
    if (preset) {
      void loadWorkoutForDate(preset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWorkoutForDate = async (date: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWorkoutByDate(getTelegramUserId(), date);
      setWorkout(data.plan);
      setWorkoutDate(data.date);
      if (data.profile) {
        setProfile(data.profile);
      }
      setTab("workout");
      await loadSchedule();
    } catch (err: unknown) {
      const e = err as Error & { code?: string };
      if (e.code === "FREE_LIMIT") {
        setError(tr("free_limit"));
        setTab("premium");
      } else if (err instanceof TypeError) {
        setError(tr("network_error"));
      } else {
        setError(err instanceof Error ? err.message : tr("load_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadGym = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const program = await fetchGymProgram(getTelegramUserId());
      setGym(program);
      setTab("gym");
    } catch (err: unknown) {
      const e = err as Error & { code?: string };
      if (e.code === "PREMIUM_REQUIRED") {
        setError(tr("premium_required"));
        setTab("premium");
      } else {
        setError(tr("load_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (logs: ExerciseLog[]): Promise<void> => {
    const date = workoutDate ?? new Date().toISOString().slice(0, 10);
    await completeWorkout(
      getTelegramUserId(),
      date,
      logs,
      locale === "ru" ? "Завершено в Mini App" : "Completed in Mini App",
    );
    setTab("home");
    setWorkout(null);
    setWorkoutDate(null);
    await loadSchedule();
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "home", label: tr("tab_home") },
    { id: "workout", label: tr("tab_workout") },
    { id: "gym", label: tr("tab_gym") },
    { id: "profile", label: tr("tab_profile") },
    { id: "premium", label: tr("tab_premium") },
  ];

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <h1>{tr("app_title")}</h1>
          <p className="tagline">{tr("app_tagline")}</p>
        </div>
        {profile?.isPremium ? <span className="pill gold">PRO</span> : null}
      </header>

      {loading ? <p className="muted center">{tr("loading")}</p> : null}
      {error ? <p className="error center">{error}</p> : null}

      <main className="main-pane">
        {tab === "home" && profile ? (
          <>
            <section className="home-grid">
              <article className="card hero-card">
                <h2>{profile.profileComplete ? "🔥" : "📋"}</h2>
                <p className="muted">
                  {profile.bmi
                    ? `${tr("bmi_label")} ${profile.bmi} · ${levelLabel(locale, profile.fitnessLevel)}`
                    : tr("complete_profile")}
                </p>
              </article>
              {!profile.isPremium ? (
                <button type="button" className="card link-card gold" onClick={() => setTab("premium")}>
                  <span>⭐</span>
                  <strong>{tr("home_premium")}</strong>
                </button>
              ) : null}
              <button type="button" className="card link-card" onClick={() => void loadGym()}>
                <span>🏋️</span>
                <strong>{tr("home_gym")}</strong>
              </button>
            </section>
            <ScheduleList
              days={schedule}
              selectedDate={workoutDate}
              onSelect={(date) => void loadWorkoutForDate(date)}
            />
          </>
        ) : null}

        {tab === "workout" && workout ? (
          <WorkoutPlayer workout={workout} onComplete={handleComplete} />
        ) : null}

        {tab === "gym" && gym ? <GymProgramView program={gym} todayIndex={todayGymIndex()} /> : null}

        {tab === "profile" && profile ? (
          <ProfileForm
            profile={profile}
            onSaved={(p) => {
              setProfile(p);
              void loadSchedule();
            }}
          />
        ) : null}

        {tab === "premium" && profile ? (
          <PremiumPanel
            profile={profile}
            onPaid={() => {
              void loadProfile();
            }}
          />
        ) : null}
      </main>

      <nav className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "active" : ""}
            onClick={() => {
              setError(null);
              setTab(t.id);
              if (t.id === "home") {
                void loadSchedule();
              }
              if (t.id === "gym" && !gym && profile?.isPremium) {
                void loadGym();
              }
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;

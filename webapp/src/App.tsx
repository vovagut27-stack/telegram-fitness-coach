import { useCallback, useEffect, useState } from "react";
import { WorkoutPlayer } from "./components/WorkoutPlayer";
import { ProfileForm } from "./components/ProfileForm";
import { GymProgramView } from "./components/GymProgramView";
import { PremiumPanel } from "./components/PremiumPanel";
import { ScheduleList } from "./components/ScheduleList";
import { getApiBase, probeApiHealth } from "./config";
import {
  getWorkoutDateFromUrl,
  initTelegramWebApp,
  requireTelegramUserId,
  waitForTelegramUserId,
} from "./services/telegram";
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
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [tab, setTab] = useState<TabId>("home");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [schedule, setSchedule] = useState<ScheduleDayItem[]>([]);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [workoutDate, setWorkoutDate] = useState<string | null>(null);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [gym, setGym] = useState<GymProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const p = await fetchProfile(requireTelegramUserId());
    setProfile(p);
    return p;
  }, []);

  const loadSchedule = useCallback(async () => {
    const days = await fetchSchedule(requireTelegramUserId(), 7);
    setSchedule(days);
    return days;
  }, []);

  useEffect(() => {
    initTelegramWebApp();
    let cancelled = false;

    void waitForTelegramUserId().then((id) => {
      if (cancelled) {
        return;
      }
      setTelegramId(id);
      if (!id) {
        setLoading(false);
        setError(tr("open_in_telegram"));
        return;
      }
      void probeApiHealth().then((ok) => {
        if (!ok && !cancelled) {
          setError(`${tr("network_error")} (${getApiBase()})`);
        }
      });
      Promise.all([loadProfile(), loadSchedule()])
        .catch((err) => {
          if (err instanceof TypeError) {
            setError(`${tr("network_error")} (${getApiBase()})`);
          } else {
            setError(err instanceof Error ? err.message : tr("load_error"));
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [loadProfile, loadSchedule, tr]);

  useEffect(() => {
    const preset = getWorkoutDateFromUrl();
    if (preset && telegramId) {
      void loadWorkoutForDate(preset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramId]);

  const loadWorkoutForDate = async (date: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWorkoutByDate(requireTelegramUserId(), date);
      setWorkout(data.plan);
      setWorkoutDate(data.date);
      setWorkoutCompleted(data.completed);
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
    if (!profile?.isPremium) {
      setError(tr("premium_required"));
      setTab("premium");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const program = await fetchGymProgram(requireTelegramUserId());
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
    try {
      await completeWorkout(
        requireTelegramUserId(),
        date,
        logs,
        locale === "ru" ? "Завершено в Mini App" : "Completed in Mini App",
      );
      setWorkoutCompleted(true);
      setTab("home");
      setWorkout(null);
      setWorkoutDate(null);
      await loadSchedule();
      await loadProfile();
    } catch {
      setError(tr("save_workout_error"));
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "home", label: tr("tab_home") },
    { id: "workout", label: tr("tab_workout") },
    ...(profile?.isPremium ? [{ id: "gym" as TabId, label: tr("tab_gym") }] : []),
    { id: "profile", label: tr("tab_profile") },
    { id: "premium", label: tr("tab_premium") },
  ];

  if (!telegramId) {
    return (
      <div className="app-shell">
        <header className="top-bar">
          <h1>{tr("app_title")}</h1>
        </header>
        <p className="error center">{tr("open_in_telegram")}</p>
      </div>
    );
  }

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
                <p className="muted">
                  {tr("week_done", {
                    done: String(schedule.filter((d) => d.completed).length),
                    total: String(schedule.length),
                  })}
                </p>
              </article>
              {!profile.isPremium ? (
                <button type="button" className="card link-card gold" onClick={() => setTab("premium")}>
                  <span>⭐</span>
                  <strong>{tr("home_premium")}</strong>
                </button>
              ) : (
                <button type="button" className="card link-card" onClick={() => void loadGym()}>
                  <span>🏋️</span>
                  <strong>{tr("home_gym")}</strong>
                </button>
              )}
            </section>
            <ScheduleList
              days={schedule}
              selectedDate={workoutDate}
              onSelect={(date) => void loadWorkoutForDate(date)}
            />
          </>
        ) : null}

        {tab === "workout" && workout ? (
          workoutCompleted ? (
            <section className="card">
              <h2>✅ {tr("day_done")}</h2>
              <p className="muted">{workoutDate}</p>
              <button type="button" onClick={() => setTab("home")}>
                {tr("tab_home")}
              </button>
            </section>
          ) : (
            <WorkoutPlayer
              workout={workout}
              gender={profile?.gender}
              onComplete={handleComplete}
            />
          )
        ) : null}

        {tab === "gym" && gym ? (
          <GymProgramView
            program={gym}
            todayIndex={todayGymIndex()}
            gender={profile?.gender}
          />
        ) : null}

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
              void loadProfile().then((p) => {
                setProfile(p);
                if (p.isPremium) {
                  void loadGym();
                }
              });
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
              if (t.id === "gym" && !profile?.isPremium) {
                setTab("premium");
                setError(tr("premium_required"));
                return;
              }
              setTab(t.id);
              if (t.id === "home") {
                void loadSchedule();
              }
              if (t.id === "gym" && profile?.isPremium && !gym) {
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

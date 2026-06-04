import { useCallback, useEffect, useState } from "react";
import { WorkoutPlayer } from "./components/WorkoutPlayer";
import { ProfileForm } from "./components/ProfileForm";
import { GymProgramView } from "./components/GymProgramView";
import { PremiumPanel } from "./components/PremiumPanel";
import { ScheduleList } from "./components/ScheduleList";
import { ResultsView } from "./components/ResultsView";
import { FreeLimitBanner } from "./components/FreeLimitBanner";
import { PremiumInsightsCard } from "./components/PremiumInsightsCard";
import { getApiBase, probeApiHealth } from "./config";
import {
  getWorkoutDateFromUrl,
  requireTelegramUserId,
  waitForTelegramUserId,
} from "./services/telegram";
import {
  completeWorkout,
  fetchGymProgram,
  fetchGymSchedule,
  fetchProfile,
  fetchSchedule,
  fetchUserStats,
  fetchWorkoutByDate,
  type ScheduleDayItem,
  type UserStats,
} from "./services/api";
import type { ExerciseLog, GymProgram, TabId, UserProfile, WorkoutPlan } from "./types";
import { useI18n } from "./i18n/context";
import { levelLabel } from "./i18n/levels";

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
  const [gymSchedule, setGymSchedule] = useState<ScheduleDayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultsRefreshKey, setResultsRefreshKey] = useState(0);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const loadProfile = useCallback(async () => {
    const p = await fetchProfile(requireTelegramUserId());
    setProfile(p);
    return p;
  }, []);

  const loadSchedule = useCallback(async () => {
    const id = requireTelegramUserId();
    const premium = profile?.isPremium ?? false;
    const { days } = await fetchSchedule(id, premium ? 14 : 7);
    setSchedule(days);
    return days;
  }, [profile?.isPremium]);

  const loadUserStats = useCallback(async () => {
    const stats = await fetchUserStats(requireTelegramUserId());
    setUserStats(stats);
    return stats;
  }, []);

  useEffect(() => {
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
          setError(tr("network_error"));
        }
      });
      Promise.all([loadProfile(), loadSchedule(), loadUserStats()])
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
  }, [loadProfile, loadSchedule, loadUserStats, tr]);

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
      await Promise.all([loadSchedule(), loadUserStats()]);
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

  const loadGymSchedule = useCallback(async (): Promise<void> => {
    const days = await fetchGymSchedule(requireTelegramUserId(), 7);
    setGymSchedule(days);
  }, []);

  const refreshAfterWorkout = useCallback((): void => {
    window.setTimeout(() => {
      void loadSchedule();
      void loadUserStats();
      setResultsRefreshKey((k) => k + 1);
    }, 0);
    window.setTimeout(() => {
      void loadProfile();
      if (profile?.isPremium) {
        void loadGymSchedule();
      }
    }, 400);
  }, [loadProfile, loadSchedule, loadGymSchedule, loadUserStats, profile?.isPremium]);

  const goHomeAfterWorkout = useCallback((): void => {
    setWorkout(null);
    setWorkoutDate(null);
    setWorkoutCompleted(false);
    setTab("home");
    void loadSchedule();
  }, [loadSchedule]);

  const loadGym = async (): Promise<void> => {
    if (!profile?.isPremium) {
      setError(tr("premium_required"));
      setTab("premium");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [program] = await Promise.all([
        fetchGymProgram(requireTelegramUserId()),
        loadGymSchedule(),
      ]);
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

  const handleComplete = async (
    logs: ExerciseLog[],
    dateOverride?: string,
    gymMode = false,
  ): Promise<void> => {
    const date = dateOverride ?? workoutDate ?? new Date().toISOString().slice(0, 10);
    await completeWorkout(
      requireTelegramUserId(),
      date,
      logs,
      gymMode
        ? locale === "ru"
          ? "Зал — Mini App"
          : "Gym — Mini App"
        : locale === "ru"
          ? "Завершено в Mini App"
          : "Completed in Mini App",
      gymMode,
    );
    refreshAfterWorkout();
    if (!gymMode) {
      setWorkoutCompleted(true);
    }
  };

  const handleCompleteSafe = async (
    logs: ExerciseLog[],
    dateOverride?: string,
    gymMode = false,
  ): Promise<void> => {
    try {
      await handleComplete(logs, dateOverride, gymMode);
    } catch {
      setError(tr("save_workout_error"));
      throw new Error("save failed");
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "home", label: tr("tab_home") },
    { id: "workout", label: tr("tab_workout") },
    { id: "results", label: tr("tab_results") },
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
                <h2 className="hero-streak">
                  🔥{" "}
                  {userStats && userStats.currentStreak > 0
                    ? tr("home_streak", { n: String(userStats.currentStreak) })
                    : tr("home_streak_zero")}
                </h2>
                <p className="muted">
                  {profile.bmi
                    ? `${tr("bmi_label")} ${profile.bmi} · ${levelLabel(locale, profile.fitnessLevel)}`
                    : tr("complete_profile")}
                </p>
                {userStats && userStats.currentStreak === 0 ? (
                  <p className="muted small">{tr("home_streak_none")}</p>
                ) : null}
                <p className="muted">
                  {tr("week_done", {
                    done: String(schedule.filter((d) => d.completed).length),
                    total: String(schedule.length),
                  })}
                  {userStats
                    ? ` · ${tr("home_week_sets", { n: String(userStats.totalSetsThisWeek) })}`
                    : null}
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
            <FreeLimitBanner profile={profile} onUpgrade={() => setTab("premium")} />
            {profile.isPremium ? <PremiumInsightsCard /> : null}
            {!profile.profileComplete ? (
              <section className="card onboarding-card">
                <h2>{tr("onboarding_title")}</h2>
                <p className="muted">{tr("onboarding_sub")}</p>
                <button type="button" className="btn-primary" onClick={() => setTab("profile")}>
                  {tr("onboarding_cta")}
                </button>
              </section>
            ) : null}
            <ScheduleList
              days={schedule}
              title={tr("schedule_title_days", {
                n: String(profile.isPremium ? 14 : 7),
              })}
              selectedDate={workoutDate}
              onSelect={(date) => {
                if (!profile.profileComplete) {
                  setTab("profile");
                  setError(tr("onboarding_need_profile"));
                  return;
                }
                void loadWorkoutForDate(date);
              }}
            />
          </>
        ) : null}

        {tab === "workout" && !workout ? (
          <section className="card">
            <h2>{tr("workout_pick_day")}</h2>
            <p className="muted">{tr("workout_pick_day_hint")}</p>
            <button type="button" className="btn-primary" onClick={() => setTab("home")}>
              {tr("tab_home")}
            </button>
          </section>
        ) : null}

        {tab === "home" && !profile && !loading ? (
          <section className="card">
            <p className="muted">{tr("load_error")}</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setLoading(true);
                setError(null);
                void loadProfile()
                  .then(() => loadSchedule())
                  .catch((err) => {
                    setError(err instanceof Error ? err.message : tr("load_error"));
                  })
                  .finally(() => setLoading(false));
              }}
            >
              {tr("retry")}
            </button>
          </section>
        ) : null}

        {tab === "workout" && workout ? (
          workoutCompleted ? (
            <section className="card">
              <h2>✅ {tr("day_done")}</h2>
              <p className="muted">{workoutDate}</p>
              <button type="button" onClick={() => goHomeAfterWorkout()}>
                {tr("tab_home")}
              </button>
            </section>
          ) : (
            <WorkoutPlayer
              workout={workout}
              gender={profile?.gender}
              restPreset={profile?.restPreset}
              onComplete={(logs) => handleCompleteSafe(logs)}
              onGoHome={goHomeAfterWorkout}
            />
          )
        ) : null}

        {tab === "gym" && gym ? (
          <GymProgramView
            program={gym}
            schedule={gymSchedule}
            gender={profile?.gender}
            onScheduleRefresh={() => void loadGymSchedule()}
            onCompleteWorkout={(logs, date) => handleCompleteSafe(logs, date, true)}
          />
        ) : null}

        {tab === "results" ? (
          <ResultsView
            key={resultsRefreshKey}
            isPremium={Boolean(profile?.isPremium)}
            showGymFilter={Boolean(profile?.isPremium)}
            onUpgrade={() => setTab("premium")}
            onSaved={() => {
              refreshAfterWorkout();
              void loadProfile();
            }}
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
              if (t.id === "workout" && !workout) {
                setTab("home");
                void loadSchedule();
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

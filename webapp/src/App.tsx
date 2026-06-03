import { useEffect, useState } from "react";
import { WorkoutPlayer } from "./components/WorkoutPlayer";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { getTelegramUserId, initTelegramWebApp } from "./services/telegram";
import type { ExerciseLog, WorkoutPlan } from "./types";
import { API_BASE } from "./config";
import { useI18n } from "./i18n/context";

function App() {
  const { locale, tr } = useI18n();
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initTelegramWebApp();
    setLoading(true);
    setError(null);

    const telegramId = getTelegramUserId();
    const url = `${API_BASE}/workout/today?telegramId=${telegramId}`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: WorkoutPlan) => setWorkout(data))
      .catch((err: unknown) => {
        if (err instanceof TypeError) {
          setError(tr("network_error"));
          return;
        }
        setError(err instanceof Error ? err.message : tr("load_error"));
      })
      .finally(() => setLoading(false));
  }, [locale, tr]);

  const handleComplete = async (logs: ExerciseLog[]): Promise<void> => {
    const telegramId = getTelegramUserId();
    await fetch(`${API_BASE}/workout/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegramId,
        completionNotes: locale === "ru" ? "Завершено в Mini App" : "Completed in Mini App",
        exercises: logs,
      }),
    });
  };

  return (
    <main className="container">
      <LanguageSwitcher />
      <h1>{tr("app_title")}</h1>
      {loading ? <p>{tr("loading")}</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {workout ? <WorkoutPlayer workout={workout} onComplete={handleComplete} /> : null}
    </main>
  );
}

export default App;

import { useEffect, useState } from "react";
import { WorkoutPlayer } from "./components/WorkoutPlayer";
import { getTelegramUserId, initTelegramWebApp } from "./services/telegram";
import type { ExerciseLog, WorkoutPlan } from "./types";
import { API_BASE } from "./config";

function App() {
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initTelegramWebApp();
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
          setError(
            `Network error reaching API (${url}). Check VITE_API_BASE_URL on Vercel and redeploy mini app.`,
          );
          return;
        }
        setError(err instanceof Error ? err.message : "Unable to load workout");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (logs: ExerciseLog[]): Promise<void> => {
    const telegramId = getTelegramUserId();
    await fetch(`${API_BASE}/workout/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegramId,
        completionNotes: "Completed in Mini App",
        exercises: logs,
      }),
    });
  };

  return (
    <main className="container">
      <h1>AI Workout Mini App</h1>
      {loading ? <p>Loading today's workout...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {workout ? <WorkoutPlayer workout={workout} onComplete={handleComplete} /> : null}
    </main>
  );
}

export default App;

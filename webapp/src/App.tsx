import { useEffect, useState } from "react";
import { WorkoutPlayer } from "./components/WorkoutPlayer";
import { getTelegramUserId, initTelegramWebApp } from "./services/telegram";
import type { ExerciseLog, WorkoutPlan } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

function App() {
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initTelegramWebApp();
    const telegramId = getTelegramUserId();
    fetch(`${API_BASE}/workout/today?telegramId=${telegramId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await res.text());
        }
        return res.json();
      })
      .then((data: WorkoutPlan) => setWorkout(data))
      .catch((err: unknown) => {
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

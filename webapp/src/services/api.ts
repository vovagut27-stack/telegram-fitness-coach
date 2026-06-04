import { getApiBase } from "../config";
import type {
  ExerciseLog,
  GymProgram,
  UserProfile,
  WeightLogEntry,
  WorkoutPlan,
  WorkoutResultDay,
} from "../types";

export interface ScheduleDayItem {
  date: string;
  dayLabel: string;
  focusTitle: string;
  muscles: string[];
  completed: boolean;
  hasWorkout: boolean;
  isToday: boolean;
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    return await fetch(url, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(25_000),
    });
  } catch (err) {
    const base = getApiBase();
    if (err instanceof Error) {
      throw new Error(`${err.message} → ${base}`);
    }
    throw err;
  }
}

async function parseError(res: Response): Promise<Error> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { error?: string; code?: string };
    const message = json.error ?? text;
    const err = new Error(message) as Error & { code?: string };
    if (json.code) {
      err.code = json.code;
    }
    return err;
  } catch {
    return new Error(text || `HTTP ${res.status}`);
  }
}

export async function fetchProfile(telegramId: number): Promise<UserProfile> {
  const res = await apiFetch(`/user/profile?telegramId=${telegramId}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<UserProfile>;
}

export async function saveProfile(
  profile: Partial<UserProfile> & { telegramId: number },
): Promise<UserProfile> {
  const body = JSON.stringify(profile);
  const headers = { "Content-Type": "application/json" };

  let res = await apiFetch("/user/profile", {
    method: "POST",
    headers,
    body,
  });
  if (!res.ok && (res.status === 405 || res.status === 404)) {
    res = await apiFetch("/user/profile", {
      method: "PUT",
      headers,
      body,
    });
  }
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<UserProfile>;
}

export async function saveUserSettings(
  telegramId: number,
  settings: {
    remindersEnabled?: boolean;
    reminderHour?: number;
    timezoneOffsetMinutes?: number;
    restPreset?: "short" | "normal" | "long";
  },
): Promise<UserProfile> {
  const body = JSON.stringify({ telegramId, ...settings });
  const headers = { "Content-Type": "application/json" };
  let res = await apiFetch("/user/settings", {
    method: "PATCH",
    headers,
    body,
  });
  if (!res.ok && (res.status === 405 || res.status === 404)) {
    res = await apiFetch("/user/settings", {
      method: "POST",
      headers,
      body,
    });
  }
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<UserProfile>;
}

export async function fetchSchedule(
  telegramId: number,
  days = 7,
): Promise<{ days: ScheduleDayItem[]; maxDays: number }> {
  const res = await apiFetch(`/workout/schedule?telegramId=${telegramId}&days=${days}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<{ days: ScheduleDayItem[]; maxDays: number }>;
}

export interface PersonalRecord {
  exerciseName: string;
  bestWeightKg: number | null;
  bestReps: number | null;
  bestVolumeKg: number;
  achievedDate: string;
}

export interface PremiumInsights {
  currentStreak: number;
  volumeThisWeekKg: number;
  volumeLastWeekKg: number;
  volumeChangePercent: number | null;
  workoutsThisWeek: number;
  workoutsLastWeek: number;
  personalRecordsCount: number;
  topFocus: string | null;
  weeklyVolume: Array<{
    weekStart: string;
    totalSets: number;
    totalVolumeKg: number;
    workoutsCompleted: number;
  }>;
}

export async function fetchPremiumInsights(telegramId: number): Promise<PremiumInsights> {
  const res = await apiFetch(`/user/premium-insights?telegramId=${telegramId}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<PremiumInsights>;
}

export async function fetchPersonalRecords(telegramId: number): Promise<PersonalRecord[]> {
  const res = await apiFetch(`/workout/personal-records?telegramId=${telegramId}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  const data = (await res.json()) as { records: PersonalRecord[] };
  return data.records;
}

export async function fetchWorkoutByDate(
  telegramId: number,
  date: string,
): Promise<{
  date: string;
  plan: WorkoutPlan;
  completed: boolean;
  profile: UserProfile | null;
}> {
  const res = await apiFetch(`/workout/by-date?telegramId=${telegramId}&date=${date}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<{
    date: string;
    plan: WorkoutPlan;
    completed: boolean;
    profile: UserProfile | null;
  }>;
}

export async function fetchTodayWorkout(telegramId: number): Promise<{
  date: string;
  plan: WorkoutPlan;
  profile: UserProfile | null;
}> {
  const res = await apiFetch(`/workout/today?telegramId=${telegramId}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<{ date: string; plan: WorkoutPlan; profile: UserProfile | null }>;
}

export async function completeWorkout(
  telegramId: number,
  workoutDate: string,
  exercises: unknown[],
  notes: string,
  gymMode = false,
): Promise<void> {
  const res = await apiFetch("/workout/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telegramId,
      workoutDate,
      completionNotes: notes,
      exercises,
      gymMode,
    }),
  });
  if (!res.ok) {
    throw await parseError(res);
  }
}

export async function fetchGymProgram(telegramId: number): Promise<GymProgram> {
  const res = await apiFetch(`/workout/gym-program?telegramId=${telegramId}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<GymProgram>;
}

export async function fetchGymSchedule(telegramId: number, days = 7): Promise<ScheduleDayItem[]> {
  const res = await apiFetch(`/workout/gym-schedule?telegramId=${telegramId}&days=${days}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  const data = (await res.json()) as { days: ScheduleDayItem[] };
  return data.days;
}

export async function fetchGymWorkoutByDate(
  telegramId: number,
  date: string,
): Promise<{ date: string; plan: WorkoutPlan; completed: boolean }> {
  const res = await apiFetch(`/workout/gym-by-date?telegramId=${telegramId}&date=${date}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<{ date: string; plan: WorkoutPlan; completed: boolean }>;
}

export interface ResultsComparison {
  completedThisWeek: number;
  completedLastWeek: number;
  totalSetsThisWeek: number;
  totalSetsLastWeek: number;
  weightChangeKg: number | null;
  weightTrend: "down" | "up" | "stable" | null;
  firstWeight: number | null;
  latestWeight: number | null;
}

export interface UserStats extends ResultsComparison {
  currentStreak: number;
}

export async function fetchUserStats(telegramId: number): Promise<UserStats> {
  const res = await apiFetch(`/user/stats?telegramId=${telegramId}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<UserStats>;
}

export interface WeightHistoryResponse {
  entries: WeightLogEntry[];
  comparison: Pick<
    ResultsComparison,
    "weightChangeKg" | "weightTrend" | "firstWeight" | "latestWeight"
  >;
}

export async function fetchWorkoutResults(
  telegramId: number,
  days = 60,
): Promise<{ results: WorkoutResultDay[]; comparison: ResultsComparison }> {
  const res = await apiFetch(`/workout/results?telegramId=${telegramId}&days=${days}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<{ results: WorkoutResultDay[]; comparison: ResultsComparison }>;
}

export async function fetchPlanForDate(
  telegramId: number,
  date: string,
): Promise<{ date: string; plan: WorkoutPlan }> {
  const res = await apiFetch(`/workout/plan-for-date?telegramId=${telegramId}&date=${date}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<{ date: string; plan: WorkoutPlan }>;
}

export async function saveManualWorkoutResults(
  telegramId: number,
  workoutDate: string,
  exercises: ExerciseLog[],
  completionNotes?: string,
): Promise<void> {
  const res = await apiFetch("/workout/results/manual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telegramId,
      workoutDate,
      completionNotes,
      exercises,
    }),
  });
  if (!res.ok) {
    throw await parseError(res);
  }
}

export async function fetchWeightHistory(telegramId: number): Promise<WeightHistoryResponse> {
  const res = await apiFetch(`/user/weight-history?telegramId=${telegramId}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<WeightHistoryResponse>;
}

export async function logUserWeight(
  telegramId: number,
  weightKg: number,
  logDate?: string,
  note?: string,
): Promise<WeightLogEntry[]> {
  const res = await apiFetch("/user/weight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegramId, weightKg, logDate, note }),
  });
  if (!res.ok) {
    throw await parseError(res);
  }
  const data = (await res.json()) as { entries: WeightLogEntry[] };
  return data.entries;
}

export async function fetchPremiumInvoiceLink(
  telegramId: number,
  language: string,
): Promise<string> {
  const res = await apiFetch(
    `/premium/invoice-link?telegramId=${telegramId}&language=${language}`,
  );
  if (!res.ok) {
    throw await parseError(res);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

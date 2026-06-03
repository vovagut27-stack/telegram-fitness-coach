import { API_BASE } from "../config";
import type { GymProgram, UserProfile, WorkoutPlan } from "../types";

export interface ScheduleDayItem {
  date: string;
  dayLabel: string;
  focusTitle: string;
  muscles: string[];
  completed: boolean;
  hasWorkout: boolean;
  isToday: boolean;
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
  const res = await fetch(`${API_BASE}/user/profile?telegramId=${telegramId}`);
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

  let res = await fetch(`${API_BASE}/user/profile`, {
    method: "POST",
    headers,
    body,
  });
  if (!res.ok && (res.status === 405 || res.status === 404)) {
    res = await fetch(`${API_BASE}/user/profile`, {
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

export async function fetchSchedule(telegramId: number, days = 7): Promise<ScheduleDayItem[]> {
  const res = await fetch(`${API_BASE}/workout/schedule?telegramId=${telegramId}&days=${days}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  const data = (await res.json()) as { days: ScheduleDayItem[] };
  return data.days;
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
  const res = await fetch(`${API_BASE}/workout/by-date?telegramId=${telegramId}&date=${date}`);
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
  const res = await fetch(`${API_BASE}/workout/today?telegramId=${telegramId}`);
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
): Promise<void> {
  const res = await fetch(`${API_BASE}/workout/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telegramId,
      workoutDate,
      completionNotes: notes,
      exercises,
    }),
  });
  if (!res.ok) {
    throw await parseError(res);
  }
}

export async function fetchGymProgram(telegramId: number): Promise<GymProgram> {
  const res = await fetch(`${API_BASE}/workout/gym-program?telegramId=${telegramId}`);
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<GymProgram>;
}

export async function fetchPremiumInvoiceLink(
  telegramId: number,
  language: string,
): Promise<string> {
  const res = await fetch(
    `${API_BASE}/premium/invoice-link?telegramId=${telegramId}&language=${language}`,
  );
  if (!res.ok) {
    throw await parseError(res);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

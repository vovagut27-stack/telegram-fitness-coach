import { API_BASE } from "../config";
import type { GymProgram, UserProfile, WorkoutPlan } from "../types";

export async function fetchProfile(telegramId: number): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/user/profile?telegramId=${telegramId}`);
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<UserProfile>;
}

export async function saveProfile(
  profile: Partial<UserProfile> & { telegramId: number },
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<UserProfile>;
}

export async function fetchTodayWorkout(telegramId: number): Promise<{
  plan: WorkoutPlan;
  profile: UserProfile | null;
}> {
  const res = await fetch(`${API_BASE}/workout/today?telegramId=${telegramId}`);
  if (res.status === 402) {
    const err = new Error("FREE_LIMIT") as Error & { code: string };
    err.code = "FREE_LIMIT";
    throw err;
  }
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<{ plan: WorkoutPlan; profile: UserProfile | null }>;
}

export async function fetchGymProgram(telegramId: number): Promise<GymProgram> {
  const res = await fetch(`${API_BASE}/workout/gym-program?telegramId=${telegramId}`);
  if (res.status === 402) {
    const err = new Error("PREMIUM_REQUIRED") as Error & { code: string };
    err.code = "PREMIUM_REQUIRED";
    throw err;
  }
  if (!res.ok) {
    throw new Error(await res.text());
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
    throw new Error(await res.text());
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export type Gender = "male" | "female" | "other";
export type TrainingMode = "home" | "gym";

export interface BodyProfile {
  gender: Gender | null;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  trainingMode: TrainingMode;
  profileComplete: boolean;
}

export function calcBmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function parseGender(value: unknown): Gender | null {
  if (value === "male" || value === "female" || value === "other") {
    return value;
  }
  return null;
}

export function parseTrainingMode(value: unknown): TrainingMode {
  return value === "gym" ? "gym" : "home";
}

export function isProfileComplete(body: BodyProfile): boolean {
  return (
    body.gender !== null &&
    body.age !== null &&
    body.age >= 14 &&
    body.age <= 90 &&
    body.weightKg !== null &&
    body.weightKg >= 35 &&
    body.heightCm !== null &&
    body.heightCm >= 120
  );
}

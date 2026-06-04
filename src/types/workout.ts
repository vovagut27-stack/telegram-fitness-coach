export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
  equipment: string;
  /** Рабочий вес на подход (кг), для зала. */
  weightKg?: number;
  demoUrl?: string;
  /** Second image URL if demoUrl fails to load (e.g. wger). */
  imageFallback?: string;
}

export interface WorkoutPlan {
  targetMuscles: string[];
  exercises: WorkoutExercise[];
  totalMinutes: number;
  difficultyLevel: FitnessLevel;
  notes?: string;
  programType?: "daily" | "gym";
  splitDay?: string;
  scheduleDate?: string;
  gymDayKey?: string;
  homeDayKey?: string;
  /** Версия генератора; ниже текущей — план пересоздаётся. */
  planVersion?: number;
}

export interface GymProgramDay {
  dayKey: string;
  dayLabel: string;
  focus: string;
  plan: WorkoutPlan;
}

export interface GymProgram {
  title: string;
  subtitle: string;
  days: GymProgramDay[];
}

export interface WorkoutRequest {
  userId: string;
  fitnessLevel: FitnessLevel;
  availableEquipment: string[];
  timeMinutes: number;
  lastWorkouts: WorkoutPlan[];
  targetMuscles?: string[];
  language?: "ru" | "en";
  gender?: string | null;
  age?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  bmi?: number | null;
  trainingMode?: "home" | "gym";
  goals?: string[];
}

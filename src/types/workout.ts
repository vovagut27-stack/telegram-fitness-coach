export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
  equipment: string;
  demoUrl?: string;
}

export interface WorkoutPlan {
  targetMuscles: string[];
  exercises: WorkoutExercise[];
  totalMinutes: number;
  difficultyLevel: FitnessLevel;
  notes?: string;
  programType?: "daily" | "gym";
  splitDay?: string;
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

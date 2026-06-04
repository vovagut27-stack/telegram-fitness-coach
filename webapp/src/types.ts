export type FitnessLevel = "beginner" | "intermediate" | "advanced";
export type Gender = "male" | "female" | "other";
export type TrainingMode = "home" | "gym";

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
  equipment: string;
  weightKg?: number;
  demoUrl?: string;
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

export interface UserProfile {
  telegramId: number;
  language: string;
  fitnessLevel: FitnessLevel;
  gender: Gender | null;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  bmi: number | null;
  trainingMode: TrainingMode;
  profileComplete: boolean;
  goals: string[];
  timePerSession: number;
  isPremium: boolean;
  premiumUntil: string | null;
  remindersEnabled?: boolean;
  reminderHour?: number;
  timezoneOffsetMinutes?: number;
  freeWeeklyLimit?: number;
  completedWorkoutsThisWeek?: number;
  canStartNewWorkout?: boolean;
  freeWorkoutsRemaining?: number | null;
  restPreset?: "short" | "normal" | "long";
}

export interface ExerciseLog {
  exerciseName: string;
  setsCompleted: number;
  repsCompleted: number[];
  weightUsed?: number;
  durationSeconds?: number;
}

export type TabId = "home" | "workout" | "gym" | "results" | "profile" | "premium";

export interface WorkoutResultExercise {
  exerciseName: string;
  setsCompleted: number;
  repsCompleted: number[];
  weightUsed: number | null;
  durationSeconds: number | null;
}

export interface WorkoutResultDay {
  workoutDate: string;
  completed: boolean;
  completionNotes: string | null;
  focusTitle: string | null;
  programType?: "daily" | "gym" | null;
  exercises: WorkoutResultExercise[];
}

export interface WeightLogEntry {
  id: number;
  logDate: string;
  weightKg: number;
  note: string | null;
}

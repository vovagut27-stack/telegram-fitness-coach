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
}

export interface WorkoutRequest {
  userId: string;
  fitnessLevel: FitnessLevel;
  availableEquipment: string[];
  timeMinutes: number;
  lastWorkouts: WorkoutPlan[];
  targetMuscles?: string[];
}

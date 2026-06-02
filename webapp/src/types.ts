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
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  notes?: string;
}

export interface ExerciseLog {
  exerciseName: string;
  setsCompleted: number;
  repsCompleted: number[];
  durationSeconds: number;
}

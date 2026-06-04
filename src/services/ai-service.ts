import type { WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { generateWorkoutWithAiPicker } from "./ai-workout-picker.js";
import { buildTemplateWorkout } from "./workout-templates.js";

export class AIWorkoutService {
  /**
   * Собирает тренировку через OpenAI, выбирая только упражнения из каталога
   * (дом или зал) по фокусу дня: ноги, грудь, плечи и т.д.
   */
  async generateWorkout(
    request: WorkoutRequest,
    options?: {
      workoutDate?: string;
      splitTitle?: string;
      dayKey?: string;
    },
  ): Promise<WorkoutPlan> {
    const mode = request.trainingMode === "gym" ? "gym" : "home";

    try {
      return await generateWorkoutWithAiPicker(request, {
        mode,
        workoutDate: options?.workoutDate,
        splitTitle: options?.splitTitle,
        dayKey: options?.dayKey,
        programType: mode === "gym" ? "gym" : "daily",
      });
    } catch (err) {
      console.error("AIWorkoutService.generateWorkout failed:", err);
      if (mode === "gym") {
        throw err;
      }
      return buildTemplateWorkout(request, options?.workoutDate);
    }
  }
}

import { OpenAI } from "openai";
import { env } from "../config/env.js";
import { WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { buildTemplateWorkout, normalizeWorkoutPlan } from "./workout-templates.js";

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: 12_000,
  maxRetries: 1,
});

export class AIWorkoutService {
  async generateWorkout(request: WorkoutRequest): Promise<WorkoutPlan> {
    const templateFallback = buildTemplateWorkout(request);

    try {
      const aiCall = client.responses.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        input: [
          {
            role: "system",
            content: `You are a fitness coach. Respond in ${request.language === "en" ? "English" : "Russian"} (exercise names and instructions in that language). Return strict JSON only, no markdown. Keep plans safe and realistic. Always include 4 to 6 different exercises — never fewer than 4.`,
          },
          {
            role: "user",
            content: this.buildPrompt(request),
          },
        ],
      });

      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("OpenAI timeout")), 12_000);
      });

      const response = await Promise.race([aiCall, timeout]);

      const text = response.output_text?.trim();
      if (!text) {
        return templateFallback;
      }

      const parsed = JSON.parse(text) as WorkoutPlan;
      return normalizeWorkoutPlan(parsed, request);
    } catch (err) {
      console.error("OpenAI generateWorkout failed, using template:", err);
      return templateFallback;
    }
  }

  private buildPrompt(request: WorkoutRequest): string {
    const exerciseCount = request.timeMinutes <= 20 ? 4 : request.timeMinutes <= 35 ? 5 : 6;

    return JSON.stringify(
      {
        ...request,
        requirements: {
          exerciseCount: `${exerciseCount} different exercises (minimum 4, maximum 6)`,
          variety: "Use different movement patterns (push, pull, squat, hinge, core) where appropriate for the target muscles",
          noDuplicates: "Each exercise must have a unique name",
        },
        personalizationLogic: [
          "Track completed workouts and adjust difficulty",
          "Rotate muscle groups with push/pull/legs cycle",
          "Respect equipment and time limits",
          "Factor in rest days and recovery",
        ],
        outputSchema: {
          targetMuscles: ["string"],
          exercises: `array of ${exerciseCount} items, each:`,
          exerciseItem: {
            name: "string",
            sets: 3,
            reps: "8-12",
            restSeconds: 60,
            instructions: "string",
            equipment: "string",
            demoUrl: "optional string",
          },
          totalMinutes: request.timeMinutes,
          difficultyLevel: request.fitnessLevel,
          notes: "string",
        },
      },
      null,
      2,
    );
  }
}

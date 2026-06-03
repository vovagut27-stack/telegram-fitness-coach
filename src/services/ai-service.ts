import OpenAI from "openai";
import { env } from "../config/env.js";
import { WorkoutPlan, WorkoutRequest } from "../types/workout.js";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const fallbackWorkout: WorkoutPlan = {
  targetMuscles: ["chest", "triceps"],
  exercises: [
    {
      name: "Push-ups",
      sets: 3,
      reps: "8-12",
      restSeconds: 60,
      instructions: "Keep core tight and use full range of motion.",
      equipment: "none",
    },
  ],
  totalMinutes: 25,
  difficultyLevel: "beginner",
  notes: "Focus on form over speed.",
};

export class AIWorkoutService {
  async generateWorkout(request: WorkoutRequest): Promise<WorkoutPlan> {
    try {
      const response = await client.responses.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        input: [
          {
            role: "system",
            content:
              "You are a fitness coach. Return strict JSON only, no markdown. Keep plans safe and realistic.",
          },
          {
            role: "user",
            content: this.buildPrompt(request),
          },
        ],
      });

      const text = response.output_text?.trim();
      if (!text) {
        return { ...fallbackWorkout, difficultyLevel: request.fitnessLevel };
      }

      const parsed = JSON.parse(text) as WorkoutPlan;
      return parsed;
    } catch (err) {
      console.error("OpenAI generateWorkout failed, using fallback:", err);
      return { ...fallbackWorkout, difficultyLevel: request.fitnessLevel };
    }
  }

  private buildPrompt(request: WorkoutRequest): string {
    return JSON.stringify(
      {
        ...request,
        personalizationLogic: [
          "Track completed workouts and adjust difficulty",
          "Rotate muscle groups with push/pull/legs cycle",
          "Respect equipment and time limits",
          "Factor in rest days and recovery",
        ],
        outputSchema: {
          targetMuscles: ["string"],
          exercises: [
            {
              name: "string",
              sets: 3,
              reps: "8-12",
              restSeconds: 60,
              instructions: "string",
              equipment: "string",
              demoUrl: "optional string",
            },
          ],
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

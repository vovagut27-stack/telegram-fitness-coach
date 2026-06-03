import { env } from "../config/env.js";
import { WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { buildTemplateWorkout, normalizeWorkoutPlan } from "./workout-templates.js";

const AI_TIMEOUT_MS = 5_000;

let openaiClient: import("openai").OpenAI | null = null;

async function getOpenAIClient(): Promise<import("openai").OpenAI> {
  if (!openaiClient) {
    const { OpenAI } = await import("openai");
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      timeout: AI_TIMEOUT_MS,
      maxRetries: 0,
    });
  }
  return openaiClient;
}

export class AIWorkoutService {
  async generateWorkout(request: WorkoutRequest): Promise<WorkoutPlan> {
    const templateFallback = buildTemplateWorkout(request);

    try {
      const client = await getOpenAIClient();
      const exerciseCount = request.timeMinutes <= 20 ? 4 : request.timeMinutes <= 35 ? 5 : 6;

      const aiCall = client.responses.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        input: [
          {
            role: "system",
            content: `Fitness coach. ${request.language === "en" ? "English" : "Russian"}. JSON only. Exactly ${exerciseCount} exercises.`,
          },
          {
            role: "user",
            content: JSON.stringify({
              fitnessLevel: request.fitnessLevel,
              equipment: request.availableEquipment,
              minutes: request.timeMinutes,
              targetMuscles: request.targetMuscles,
            }),
          },
        ],
      });

      const timeout = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), AI_TIMEOUT_MS);
      });

      const response = await Promise.race([aiCall, timeout]);
      if (!response) {
        return templateFallback;
      }

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
}

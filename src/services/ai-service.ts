import { env } from "../config/env.js";
import { WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { buildTemplateWorkout, normalizeWorkoutPlan } from "./workout-templates.js";

const AI_TIMEOUT_MS = 8_000;

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

function profileBlock(request: WorkoutRequest, locale: "ru" | "en"): string {
  const lines: string[] = [];
  if (request.gender) {
    lines.push(locale === "ru" ? `Пол: ${request.gender}` : `Gender: ${request.gender}`);
  }
  if (request.age) {
    lines.push(locale === "ru" ? `Возраст: ${request.age}` : `Age: ${request.age}`);
  }
  if (request.weightKg && request.heightCm) {
    lines.push(
      locale === "ru"
        ? `Рост/вес: ${request.heightCm} см, ${request.weightKg} кг, BMI ${request.bmi ?? "—"}`
        : `Height/weight: ${request.heightCm} cm, ${request.weightKg} kg, BMI ${request.bmi ?? "—"}`,
    );
  }
  if (request.trainingMode) {
    lines.push(
      locale === "ru"
        ? `Формат: ${request.trainingMode === "gym" ? "зал" : "дом"}`
        : `Mode: ${request.trainingMode}`,
    );
  }
  return lines.join(". ");
}

export class AIWorkoutService {
  async generateWorkout(request: WorkoutRequest): Promise<WorkoutPlan> {
    const templateFallback = buildTemplateWorkout(request);
    const locale = request.language === "en" ? "en" : "ru";

    try {
      const client = await getOpenAIClient();
      const exerciseCount = request.timeMinutes <= 25 ? 4 : request.timeMinutes <= 40 ? 5 : 6;
      const profile = profileBlock(request, locale);

      const system =
        locale === "ru"
          ? `Ты элитный фитнес-тренер. Ответ строго JSON без markdown. Ровно ${exerciseCount} РАЗНЫХ упражнений. Учитывай пол, возраст, BMI, цели, оборудование. Безопасные нагрузки.`
          : `You are an elite fitness coach. Strict JSON only. Exactly ${exerciseCount} DIFFERENT exercises. Use gender, age, BMI, goals, equipment. Safe loads.`;

      const userPayload = {
        profile: profile || "default adult",
        fitnessLevel: request.fitnessLevel,
        equipment: request.availableEquipment,
        minutes: request.timeMinutes,
        targetMuscles: request.targetMuscles,
        goals: request.goals,
        recentFocus: request.lastWorkouts.map((w) => w.targetMuscles?.join(", ")).slice(0, 2),
      };

      const aiCall = client.responses.create({
        model: "gpt-4o-mini",
        temperature: 0.65,
        input: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(userPayload) },
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

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().default("local-secret"),
  WEBAPP_URL: z.string().default(""),
  FREE_WORKOUTS_PER_WEEK: z.coerce.number().default(3),
  /** Set to "true" to wait for OpenAI on new workouts (slower). Default: instant template plans. */
  USE_AI_WORKOUTS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

const parsed = envSchema.safeParse(process.env);

export const envConfigValid = parsed.success;
export const envIssues = parsed.success ? null : parsed.error.flatten().fieldErrors;

export function getEnv(): z.infer<typeof envSchema> {
  if (!parsed.success) {
    throw new Error(
      `Missing or invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    );
  }
  return parsed.data;
}

/** Use getEnv() in new code; this proxy keeps existing imports working after validation. */
export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof z.infer<typeof envSchema>];
  },
});

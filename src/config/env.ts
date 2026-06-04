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
  /** Telegram Stars price for 30-day premium (XTR amount, e.g. 100 = 100 Stars). */
  PREMIUM_STARS_PRICE: z.coerce.number().default(150),
  PREMIUM_DAYS: z.coerce.number().default(30),
  /** Comma-separated Telegram user IDs allowed to use /devpremium toggle */
  ADMIN_TELEGRAM_IDS: z.string().default(""),
  /** Comma-separated IDs to receive /report messages (falls back to ADMIN_TELEGRAM_IDS) */
  REPORT_TELEGRAM_IDS: z.string().default(""),
  /** Secret word: /devpremium <secret> — test Premium without admin ID */
  DEV_PREMIUM_SECRET: z.string().default(""),
  /** Bearer token for Vercel Cron → GET /api/cron/reminders */
  CRON_SECRET: z.string().default(""),
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

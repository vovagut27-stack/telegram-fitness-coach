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
});

export const env = envSchema.parse(process.env);

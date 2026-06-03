import { Pool } from "pg";
import { env } from "../config/env.js";

const useSsl =
  !env.DATABASE_URL.includes("localhost") && !env.DATABASE_URL.includes("127.0.0.1");

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  max: 3,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 8_000,
});

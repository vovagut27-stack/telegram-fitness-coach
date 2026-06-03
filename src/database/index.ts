import type { QueryResult, QueryResultRow } from "pg";
import { Pool as PgPool } from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { env } from "../config/env.js";
import {
  isLocalDatabase,
  normalizeDatabaseUrl,
  shouldUseNeonDriver,
} from "./connection.js";

const connectionString = normalizeDatabaseUrl(env.DATABASE_URL);

export interface DbClient {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<R>>;
  end?: () => Promise<void>;
}

function createPool(): DbClient {
  if (shouldUseNeonDriver(connectionString)) {
    neonConfig.webSocketConstructor = ws;
    neonConfig.poolQueryViaFetch = true;
    const pool = new NeonPool({ connectionString });
    const client = pool as unknown as DbClient;
    client.end = () => pool.end();
    return client;
  }

  const useSsl = !isLocalDatabase(connectionString);
  const pool = new PgPool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    max: isLocalDatabase(connectionString) ? 5 : 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 25_000,
    allowExitOnIdle: true,
  });
  const client = pool as DbClient;
  client.end = () => pool.end();
  return client;
}

export const db = createPool();

export async function pingDatabase(retries = 3): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await db.query("SELECT 1");
      return;
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

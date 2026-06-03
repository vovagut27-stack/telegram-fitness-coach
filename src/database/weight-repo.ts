import { db } from "./index.js";

export interface WeightLogEntry {
  id: number;
  logDate: string;
  weightKg: number;
  note: string | null;
}

export async function addWeightLog(
  telegramId: number,
  weightKg: number,
  logDate: string,
  note?: string | null,
): Promise<void> {
  await db.query(
    `
      INSERT INTO weight_logs (telegram_id, weight_kg, log_date, note)
      VALUES ($1::bigint, $2, $3::date, $4)
      ON CONFLICT (telegram_id, log_date)
      DO UPDATE SET weight_kg = EXCLUDED.weight_kg, note = EXCLUDED.note
    `,
    [String(telegramId), weightKg, logDate, note ?? null],
  );
}

export async function getWeightHistory(
  telegramId: number,
  limit = 90,
): Promise<WeightLogEntry[]> {
  const result = await db.query(
    `
      SELECT id, log_date, weight_kg, note
      FROM weight_logs
      WHERE telegram_id = $1::bigint
      ORDER BY log_date DESC
      LIMIT $2
    `,
    [String(telegramId), limit],
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    logDate: String(row.log_date).slice(0, 10),
    weightKg: Number(row.weight_kg),
    note: row.note ? String(row.note) : null,
  }));
}

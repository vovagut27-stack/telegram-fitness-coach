import { db } from "./index.js";
export async function upsertUser(user) {
    await db.query(`
    INSERT INTO users (telegram_id, fitness_level, available_equipment, goals, time_per_session, is_premium)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (telegram_id)
    DO UPDATE SET
      fitness_level = EXCLUDED.fitness_level,
      available_equipment = EXCLUDED.available_equipment,
      goals = EXCLUDED.goals,
      time_per_session = EXCLUDED.time_per_session
  `, [
        user.telegramId,
        user.fitnessLevel,
        user.availableEquipment,
        user.goals,
        user.timePerSession,
        user.isPremium,
    ]);
}
export async function getUser(telegramId) {
    const result = await db.query(`
      SELECT telegram_id, fitness_level, available_equipment, goals, time_per_session, is_premium
      FROM users
      WHERE telegram_id = $1
    `, [telegramId]);
    if (!result.rows[0]) {
        return null;
    }
    const row = result.rows[0];
    return {
        telegramId: Number(row.telegram_id),
        fitnessLevel: row.fitness_level,
        availableEquipment: row.available_equipment,
        goals: row.goals,
        timePerSession: row.time_per_session,
        isPremium: row.is_premium,
    };
}
export async function upgradePremium(telegramId, days) {
    await db.query(`
      UPDATE users
      SET is_premium = TRUE, premium_until = NOW() + ($2 || ' days')::interval
      WHERE telegram_id = $1
    `, [telegramId, days]);
}

-- Fix tables created before UNIQUE constraint was added (CREATE TABLE IF NOT EXISTS skips it).
CREATE UNIQUE INDEX IF NOT EXISTS workouts_telegram_id_workout_date_uidx
  ON workouts (telegram_id, workout_date);

ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(5) NOT NULL DEFAULT 'ru';

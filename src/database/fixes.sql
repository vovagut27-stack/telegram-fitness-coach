-- Fix tables created before UNIQUE constraint was added (CREATE TABLE IF NOT EXISTS skips it).
CREATE UNIQUE INDEX IF NOT EXISTS workouts_telegram_id_workout_date_uidx
  ON workouts (telegram_id, workout_date);

ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(5);
UPDATE users SET language = 'ru' WHERE language IS NULL;
ALTER TABLE users ALTER COLUMN language SET DEFAULT 'ru';

ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5, 2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS training_mode VARCHAR(10) DEFAULT 'home';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP NULL;

UPDATE users SET training_mode = 'home' WHERE training_mode IS NULL;
UPDATE users SET profile_complete = COALESCE(profile_complete, FALSE);
UPDATE users SET is_premium = COALESCE(is_premium, FALSE);
UPDATE users SET available_equipment = ARRAY['bodyweight']::text[]
  WHERE available_equipment IS NULL;

CREATE TABLE IF NOT EXISTS weight_logs (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL REFERENCES users(telegram_id),
  weight_kg DECIMAL(5, 2) NOT NULL,
  log_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (telegram_id, log_date)
);

CREATE INDEX IF NOT EXISTS weight_logs_telegram_id_log_date_idx
  ON weight_logs (telegram_id, log_date DESC);

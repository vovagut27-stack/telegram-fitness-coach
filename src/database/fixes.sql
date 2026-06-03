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
UPDATE users SET training_mode = 'home' WHERE training_mode IS NULL;
UPDATE users SET profile_complete = FALSE WHERE profile_complete IS NULL;

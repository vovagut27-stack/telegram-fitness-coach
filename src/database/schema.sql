CREATE TABLE IF NOT EXISTS users (
  telegram_id BIGINT PRIMARY KEY,
  fitness_level VARCHAR(20) NOT NULL DEFAULT 'beginner',
  available_equipment TEXT[] NOT NULL DEFAULT ARRAY['bodyweight'],
  goals TEXT[] NOT NULL DEFAULT ARRAY['strength'],
  time_per_session INTEGER NOT NULL DEFAULT 25,
  language VARCHAR(5) NOT NULL DEFAULT 'ru',
  gender VARCHAR(10),
  age INTEGER,
  weight_kg DECIMAL(5, 2),
  height_cm INTEGER,
  training_mode VARCHAR(10) NOT NULL DEFAULT 'home',
  profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  premium_until TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL REFERENCES users(telegram_id),
  workout_date DATE NOT NULL,
  ai_generated_plan JSONB NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completion_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (telegram_id, workout_date)
);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER NOT NULL REFERENCES workouts(id),
  exercise_name VARCHAR(100) NOT NULL,
  sets_completed INTEGER NOT NULL,
  reps_completed INTEGER[] NOT NULL DEFAULT '{}',
  weight_used DECIMAL,
  duration_seconds INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

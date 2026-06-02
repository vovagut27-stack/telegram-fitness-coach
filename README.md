# Telegram AI Fitness MVP

Deployable MVP: Telegram bot + Express API + PostgreSQL + React Mini App.

## What is included

- Telegram commands: `/start`, `/today`, `/progress`, `/settings`
- Webhook-based bot setup with Telegraf
- AI workout generation via OpenAI with JSON response format
- Personalization baseline:
  - Push/Pull/Legs muscle rotation
  - Difficulty adaptation by weekly activity
  - Equipment and time constraints support
- Mini App workout player with:
  - Exercise cards and instructions
  - Rest timer
  - Set completion and session save
- PostgreSQL schema for users, workouts, and exercise logs
- Freemium gate (weekly free limit) + Telegram Stars payment hook

## Project structure

- `src/server.ts` - backend app bootstrap
- `src/bot/` - bot setup, commands, keyboards
- `src/services/` - AI and workout business logic
- `src/database/` - DB pool, schema, repositories
- `src/routes/api.ts` - Mini App API endpoints
- `webapp/` - React Mini App frontend

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   - Root: `npm install`
   - Mini App: `cd webapp && npm install`
3. Initialize DB schema:
   - `npm run db:init`
4. Run backend:
   - `npm run dev`
5. Run mini app:
   - `cd webapp && npm run dev`

## Production notes

- Configure HTTPS domain for bot webhook and Mini App URL.
- Set `APP_BASE_URL` and `WEBAPP_URL` to production HTTPS URLs.
- Build commands:
  - Backend: `npm run build`
  - Webapp: `cd webapp && npm run build`

## Deploy to Vercel (2 projects)

Use two separate Vercel projects:

1. Backend project from repository root (`/`).
2. Mini App project from `webapp/`.

Backend env vars:

- `APP_BASE_URL=https://<your-backend>.vercel.app`
- `TELEGRAM_BOT_TOKEN=...`
- `OPENAI_API_KEY=...`
- `DATABASE_URL=...`
- `TELEGRAM_WEBHOOK_SECRET=...`
- `WEBAPP_URL=https://<your-miniapp>.vercel.app`
- `FREE_WORKOUTS_PER_WEEK=3`

Mini App env vars:

- `VITE_API_BASE_URL=https://<your-backend>.vercel.app/api`

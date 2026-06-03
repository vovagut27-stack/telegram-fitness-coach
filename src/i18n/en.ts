export const en = {
  bot_start_short: "💪 FitBot — workouts in the app ↓",
  bot_open_app: "Open FitBot",
  btn_open_app: "🏋️ Open app",
  btn_plan: "📅 Weekly plan",
  btn_premium: "⭐ Premium",
  bot_plan_header: "📅 Plan (tap a day to open workout):",
  bot_premium_ok: "Premium active! Open the app 👇",
  bot_premium_off: "Premium disabled (test).",
  bot_premium_on: "Premium enabled (test) until {date}.",
  bot_premium_error: "Could not create invoice. Try /premium",
  bot_my_id: "Your Telegram ID: {id}\n\nAdd to Vercel → ADMIN_TELEGRAM_IDS={id}\nor set DEV_PREMIUM_SECRET and send:\n/devpremium your_secret",
  bot_dev_denied:
    "Access denied.\nYour ID: {id}\n\n1) Vercel: ADMIN_TELEGRAM_IDS={id}\n2) Or DEV_PREMIUM_SECRET=word → /devpremium word\n/myid — show ID",
  bot_error_generic: "Error. Tap /start",
  bot_db_not_ready: "Database unavailable. Try later.",
} as const;

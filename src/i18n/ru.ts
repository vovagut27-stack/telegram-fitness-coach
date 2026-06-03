export const ru = {
  bot_start_short: "💪 FitBot — тренировки в приложении ↓",
  bot_open_app: "Открыть FitBot",
  btn_open_app: "🏋️ Открыть приложение",
  btn_plan: "📅 План на неделю",
  btn_premium: "⭐ Premium",
  bot_plan_header: "📅 План (нажми день — откроется тренировка):",
  bot_premium_ok: "Premium активен! Открой приложение 👇",
  bot_premium_off: "Premium выключен (тест).",
  bot_premium_on: "Premium включён (тест) до {date}.",
  bot_premium_error: "Не удалось выставить счёт. Попробуй /premium",
  bot_my_id: "Твой Telegram ID: {id}\n\nДобавь в Vercel → ADMIN_TELEGRAM_IDS={id}\nили задай DEV_PREMIUM_SECRET и пиши:\n/devpremium твой_секрет",
  bot_dev_denied:
    "Нет доступа.\nТвой ID: {id}\n\n1) Vercel: ADMIN_TELEGRAM_IDS={id}\n2) Или DEV_PREMIUM_SECRET=слово → /devpremium слово\n/myid — показать ID",
  bot_error_generic: "Ошибка. Нажми /start",
  bot_db_not_ready: "База недоступна. Попробуй позже.",
} as const;

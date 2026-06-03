# Оплата Premium через Telegram Stars

## Что получает пользователь

- **30 дней Premium** (настраивается `PREMIUM_DAYS`)
- Безлимитные тренировки (нет лимита 3/неделю)
- **Программа зала на 4 дня** (грудь/спина/ноги/плечи)
- Полная **AI-персонализация** по полу, возрасту, росту, весу (BMI)

## Шаг 1 — Включить Stars у бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. Выберите вашего бота → **Payments**
3. Подключите **Telegram Stars** (цифровые товары)
4. Для Stars **provider token не нужен** — в коде уже `provider_token: ""`

## Шаг 2 — Переменные на Vercel (backend)

| Переменная | Пример | Описание |
|------------|--------|----------|
| `PREMIUM_STARS_PRICE` | `150` | Цена в Stars (XTR), 150 = 150 ⭐ |
| `PREMIUM_DAYS` | `30` | Дней Premium после оплаты |
| `WEBAPP_URL` | `https://your-webapp.vercel.app` | HTTPS Mini App |

## Шаг 3 — Как платит пользователь

**В боте:** `/start` → кнопка **⭐ Premium** или команда `/premium`

**В Mini App:** вкладка **Premium** → **Оплатить Telegram Stars**

После оплаты бот пишет «Premium активен», в приложении появляется бейдж **PRO**.

## Шаг 4 — Вывод Stars (для вас)

1. [@BotFather](https://t.me/BotFather) → ваш бот → **Payments** → **Balance**
2. Или [@PremiumBot](https://t.me/PremiumBot) / раздел Stars в настройках бота
3. Вывод на Fragment (TON) по правилам Telegram

Подробнее: [Telegram Stars для ботов](https://core.telegram.org/bots/payments-stars)

## Шаг 5 — Проверка

1. Тестовый платёж в боте: `/premium` → оплатить Stars
2. `GET /api/user/profile?telegramId=...` → `"isPremium": true`
3. Вкладка **Зал** в Mini App открывает 4-дневную программу

## Цена

Измените `PREMIUM_STARS_PRICE` на Vercel и redeploy backend.  
Рекомендация для старта: **100–200 Stars** (~$1–3 экв.).

## AI

| Режим | Когда |
|-------|--------|
| Шаблоны (быстро) | Профиль не заполнен |
| **OpenAI** | Профиль заполнен ИЛИ Premium ИЛИ `USE_AI_WORKOUTS=true` |

Для максимального AI на всех: `USE_AI_WORKOUTS=true` на Vercel.

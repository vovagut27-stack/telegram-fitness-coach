# Деплой на Vercel (2 проекта)

## 1. Backend — `telegram-fitness-coach` (корень репозитория)

| Настройка | Значение |
|-----------|----------|
| Root Directory | *(пусто)* |
| Framework Preset | **Other** |
| Build Command | *(пусто)* |
| Output Directory | **(пусто — обязательно!)** |
| Install Command | `npm install` |

Не указывайте `dist` в Output Directory — backend работает через **`api/index.ts`**.

### Переменные окружения (backend)

| Переменная | Пример |
|------------|--------|
| `DATABASE_URL` | **Pooled connection** из Neon (см. ниже) |
| `TELEGRAM_BOT_TOKEN` | от @BotFather |
| `OPENAI_API_KEY` | ключ OpenAI |
| `APP_BASE_URL` | `https://telegram-fitness-coach.vercel.app` |
| `WEBAPP_URL` | URL Mini App на Vercel |
| `TELEGRAM_WEBHOOK_SECRET` | любая длинная строка |

### База данных Neon (важно!)

На Vercel обычный `pg` к Postgres часто даёт **Connection timeout**.

1. Откройте [Neon Console](https://console.neon.tech) → ваш проект → **Connect**
2. Выберите **Connection string** → вкладка **Pooled connection** (не Direct!)
3. Скопируйте URL — в хосте должно быть **`-pooler`**, например:  
   `ep-xxxx-pooler.us-east-2.aws.neon.tech`
4. Вставьте в Vercel → backend → **Environment Variables** → `DATABASE_URL`
5. **Redeploy** backend

Проверка после деплоя:

`https://ВАШ-BACKEND.vercel.app/api/health`

Ожидается:

```json
{
  "ok": true,
  "database": "connected",
  "dbDriver": "neon-serverless",
  "pooledHost": true
}
```

Если `database: "error"` и timeout — `DATABASE_URL` не pooled или неверный пароль.

Код сам подставляет `-pooler` в URL Neon, если вы случайно вставили Direct — но лучше взять строку из Neon сразу.

---

## 2. Mini App — второй проект Vercel

| Настройка | Значение |
|-----------|----------|
| Root Directory | `webapp` |
| Framework Preset | **Vite** |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### API из Mini App (без CORS)

В `webapp/vercel.json` настроен прокси:

`/api/*` → `https://telegram-fitness-coach.vercel.app/api/*`

Mini App ходит на **тот же домен** (`/api/...`), Vercel пересылает на backend.

Если backend на **другом** URL — измените `destination` в `webapp/vercel.json` и сделайте Redeploy webapp.

`VITE_API_BASE_URL` для production **не обязателен** (используется только в `npm run dev`).

Файл `webapp/public/app-config.json` содержит `"apiBase": "/api"`.

---

## Напоминания (cron) на Hobby

Встроенный cron в `vercel.json` **не используем**: на плане Hobby Vercel разрешает только **раз в сутки**.  
Расписание `0 * * * *` (каждый час) даёт ошибку при деплое:

> Hobby accounts are limited to daily cron jobs.

Для напоминаний в разных часовых поясах нужен **внешний** вызов раз в час:

1. Backend → `CRON_SECRET` = длинная случайная строка.
2. [cron-job.org](https://cron-job.org) (бесплатно) или GitHub Actions:
   - URL: `https://telegram-fitness-coach.vercel.app/api/cron/reminders`
   - Расписание: каждый час (`0 * * * *`)
   - Заголовок: `Authorization: Bearer ВАШ_CRON_SECRET`

Проверка вручную:

```bash
curl -H "Authorization: Bearer ВАШ_CRON_SECRET" "https://ВАШ-BACKEND.vercel.app/api/cron/reminders"
```

Ожидается: `{"ok":true,"scanned":...,"sent":...}`

---

## Ошибки

**Деплой не создаётся / падает без логов в приложении**  
→ Проверьте, нет ли в backend `vercel.json` почасового `crons` (см. выше). Redeploy после исправления.

**«No entrypoint found in output directory dist»**  
→ В **backend**-проекте очистите Output Directory (должно быть пусто).

**«Нет связи с API»** в Mini App  
→ Проверьте `destination` в `webapp/vercel.json` (URL backend) и redeploy webapp.

**`/api/health` → Connection timeout**  
→ `DATABASE_URL` = Neon **Pooled connection**, redeploy backend.

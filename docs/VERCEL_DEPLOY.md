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

### Переменная Mini App (обязательно!)

| Переменная | Значение |
|------------|----------|
| `VITE_API_BASE_URL` | `https://telegram-fitness-coach.vercel.app/api` |

Замените домен на **ваш** backend URL. Должен заканчиваться на **`/api`**.

Без этой переменной в Mini App будет: **«Нет связи с API»**.

После изменения — **Redeploy** webapp (переменные Vite вшиваются при сборке).

---

## Ошибки

**«No entrypoint found in output directory dist»**  
→ В **backend**-проекте очистите Output Directory.

**«Нет связи с API»** в Mini App  
→ Задайте `VITE_API_BASE_URL` в проекте **webapp** и redeploy.

**`/api/health` → Connection timeout**  
→ `DATABASE_URL` = Neon **Pooled connection**, redeploy backend.

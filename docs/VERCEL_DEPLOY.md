# Деплой на Vercel (2 проекта)

## 1. Backend — `telegram-fitness-coach` (корень репозитория)

| Настройка | Значение |
|-----------|----------|
| Root Directory | *(пусто)* |
| Framework Preset | **Other** |
| Build Command | *(пусто)* |
| Output Directory | **(пусто — обязательно!)** |
| Install Command | `npm install` |

Не указывайте `dist` в Output Directory — backend работает через **`api/index.ts`**, а не как Node-приложение из `dist/`.

Файл `vercel.json` в корне уже настроен: rewrites → `/api`, serverless function `api/index.ts`.

## 2. Mini App — `telegram-fitness-coach-euen` (или второй проект)

| Настройка | Значение |
|-----------|----------|
| Root Directory | `webapp` |
| Framework Preset | **Vite** |
| Build Command | `npm run build` |
| Output Directory | `dist` |

## Ошибки

**«No entrypoint found in output directory dist»**  
→ В настройках **backend**-проекта очистите Output Directory и сделайте Redeploy.

**«No Output Directory named dist found»**  
→ Это для **webapp**-проекта: Root Directory = `webapp`, Output = `dist`.
